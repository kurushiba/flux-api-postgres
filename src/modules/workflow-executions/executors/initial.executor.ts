import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';

export async function initialExecutor(
  _node: WorkflowNode,
  _previousOutput: unknown
): Promise<unknown> {
  return { message: 'Workflow started' };
}
