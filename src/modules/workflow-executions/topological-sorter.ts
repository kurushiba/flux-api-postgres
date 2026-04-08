import { WorkflowNode } from '../workflow-nodes/workflow-node.entity';
import { WorkflowEdge } from '../workflow-edges/workflow-edge.entity';

export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  startNodeId?: string,
): WorkflowNode[] {
  // Build adjacency list (skip invalid/orphaned edges)
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }
  for (const edge of edges) {
    if (!adj.has(edge.sourceNodeId) || !adj.has(edge.targetNodeId)) continue;
    adj.get(edge.sourceNodeId)!.push(edge.targetNodeId);
  }

  // BFS from startNodeId to compute reachable node IDs
  let reachable: Set<string>;
  if (startNodeId && adj.has(startNodeId)) {
    reachable = new Set<string>();
    const bfsQueue = [startNodeId];
    while (bfsQueue.length > 0) {
      const id = bfsQueue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      for (const nextId of adj.get(id) ?? []) {
        if (!reachable.has(nextId)) bfsQueue.push(nextId);
      }
    }
  } else {
    reachable = new Set(nodes.map((n) => n.id));
  }

  // Compute in-degrees only for reachable nodes and edges
  const inDegree = new Map<string, number>();
  for (const id of reachable) inDegree.set(id, 0);
  for (const edge of edges) {
    if (!reachable.has(edge.sourceNodeId) || !reachable.has(edge.targetNodeId)) continue;
    inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) ?? 0) + 1);
  }

  // Kahn's algorithm over reachable nodes
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) result.push(node);
    for (const nextId of adj.get(id) ?? []) {
      if (!reachable.has(nextId)) continue;
      const newDegree = (inDegree.get(nextId) ?? 0) - 1;
      inDegree.set(nextId, newDegree);
      if (newDegree === 0) queue.push(nextId);
    }
  }

  return result;
}
