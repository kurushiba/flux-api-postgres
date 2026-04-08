import { inngest, executionChannelName } from './client';
import type { ExecutionUpdate } from './client';
import { WorkflowNode } from '../modules/workflow-nodes/workflow-node.entity';
import { WorkflowEdge } from '../modules/workflow-edges/workflow-edge.entity';
import { WorkflowExecution } from '../modules/workflow-executions/workflow-execution.entity';
import { NodeExecution } from '../modules/node-executions/node-execution.entity';
import { topologicalSort } from '../modules/workflow-executions/topological-sorter';
import { executeNode } from '../modules/workflow-executions/executors/node-executor-factory';
import datasource from '../datasource';

type PublishFn = (msg: { channel: string; topic: string; data: ExecutionUpdate }) => Promise<void>;

// inngest v3: createFunction takes 3 args (opts, trigger, handler)
export const executeWorkflowFunction = inngest.createFunction(
  { id: 'execute-workflow', retries: 1 },
  { event: 'workflow/execute' },
  async (ctx) => {
    const { event, step } = ctx as { event: { data: Record<string, unknown> }; step: any };
    // publish is injected by realtimeMiddleware
    const publish = (ctx as any).publish as PublishFn;

    const { executionId, workflowId, triggerData } = event.data as {
      executionId: string;
      workflowId: string;
      triggerData?: unknown;
    };

    // Load workflow nodes and edges, then topologically sort
    // Use executionId in step ID to prevent cross-execution caching
    const { sortedNodes, predecessorMap } = await step.run(
      `load-workflow-${executionId}`,
      async () => {
        const nodeRepo = datasource.getRepository(WorkflowNode);
        const edgeRepo = datasource.getRepository(WorkflowEdge);
        const nodes = await nodeRepo.find({ where: { workflowId } });
        const edges = await edgeRepo.find({ where: { workflowId } });
        const initialNode = nodes.find((n) => n.type === 'INITIAL');
        const sorted = topologicalSort(nodes, edges, initialNode?.id);

        // Build predecessor map: each node's list of direct predecessor node IDs
        const predecessors: Record<string, string[]> = {};
        for (const node of sorted) predecessors[node.id] = [];
        for (const edge of edges) {
          if (predecessors[edge.targetNodeId] !== undefined) {
            predecessors[edge.targetNodeId].push(edge.sourceNodeId);
          }
        }
        return { sortedNodes: sorted, predecessorMap: predecessors };
      },
    );

    // Track each node's output by node ID
    const nodeOutputs = new Map<string, unknown>();
    const failedNodeIds = new Set<string>();
    let anyFailed = false;

    const channelName = executionChannelName(executionId);

    for (const node of sortedNodes) {
      // If any direct predecessor failed, skip this node (cascade failure)
      const preds: string[] = predecessorMap[node.id] ?? [];
      if (preds.some((id) => failedNodeIds.has(id))) {
        failedNodeIds.add(node.id);
        continue;
      }

      // Determine input: use the last predecessor's output, or triggerData for root nodes
      const predOutput =
        preds.length > 0
          ? (nodeOutputs.get(preds[preds.length - 1]) ?? triggerData ?? {})
          : (triggerData ?? {});

      // Deterministic ID for idempotent retries
      const nodeExecId = `${executionId}-${node.id}`;

      const result = await step.run(`execute-node-${node.id}`, async () => {
        const nodeExecRepo = datasource.getRepository(NodeExecution);

        // Mark node execution as RUNNING
        await nodeExecRepo.save({
          id: nodeExecId,
          workflowExecutionId: executionId,
          nodeId: node.id,
          nodeName: node.label,
          status: 'RUNNING' as const,
          inputData: JSON.stringify(predOutput),
          outputData: null,
          errorMessage: null,
          finishedAt: null,
        });

        try {
          await publish({
            channel: channelName,
            topic: 'update',
            data: {
              type: 'node',
              executionId,
              nodeExecutionId: nodeExecId,
              nodeId: node.id,
              nodeName: node.label,
              status: 'RUNNING',
              outputData: null,
              errorMessage: null,
            } satisfies ExecutionUpdate,
          });
        } catch { /* best effort */ }

        try {
          const output = await executeNode(node, predOutput, datasource);

          await nodeExecRepo.update(nodeExecId, {
            status: 'SUCCESS' as const,
            outputData: JSON.stringify(output),
            finishedAt: new Date(),
          });

          try {
            await publish({
              channel: channelName,
              topic: 'update',
              data: {
                type: 'node',
                executionId,
                nodeExecutionId: nodeExecId,
                nodeId: node.id,
                nodeName: node.label,
                status: 'SUCCESS',
                outputData: JSON.stringify(output),
                errorMessage: null,
              } satisfies ExecutionUpdate,
            });
          } catch { /* best effort */ }

          return { success: true as const, output };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);

          await nodeExecRepo.update(nodeExecId, {
            status: 'FAILED' as const,
            errorMessage,
            finishedAt: new Date(),
          });

          try {
            await publish({
              channel: channelName,
              topic: 'update',
              data: {
                type: 'node',
                executionId,
                nodeExecutionId: nodeExecId,
                nodeId: node.id,
                nodeName: node.label,
                status: 'FAILED',
                outputData: null,
                errorMessage,
              } satisfies ExecutionUpdate,
            });
          } catch { /* best effort */ }

          return { success: false as const, error: errorMessage };
        }
      });

      if (result.success) {
        nodeOutputs.set(node.id, result.output);
      } else {
        failedNodeIds.add(node.id);
        anyFailed = true;
        // Do NOT break — allow independent branches to continue executing
      }
    }

    // Finalize execution status
    await step.run('finalize', async () => {
      const execRepo = datasource.getRepository(WorkflowExecution);
      const finalStatus = anyFailed ? ('FAILED' as const) : ('SUCCESS' as const);
      await execRepo.update(executionId, {
        status: finalStatus,
        finishedAt: new Date(),
      });

      try {
        await publish({
          channel: channelName,
          topic: 'update',
          data: {
            type: 'execution',
            executionId,
            status: finalStatus,
          } satisfies ExecutionUpdate,
        });
      } catch { /* best effort */ }
    });
  }
);
