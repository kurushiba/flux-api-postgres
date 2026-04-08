import Handlebars from 'handlebars';
import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';

export async function httpRequestExecutor(
  node: WorkflowNode,
  previousOutput: unknown
): Promise<unknown> {
  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const context = { previousOutput: JSON.stringify(previousOutput ?? {}) };

  const urlTemplate = Handlebars.compile(params.url ?? '');
  const bodyTemplate = Handlebars.compile(params.body ?? '');
  const url = urlTemplate(context);
  const body = bodyTemplate(context);
  const method = (params.method ?? 'GET').toUpperCase();

  const fetchOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (method !== 'GET' && body) {
    fetchOptions.body = body;
  }

  const response = await fetch(url, fetchOptions);
  let data: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data };
}
