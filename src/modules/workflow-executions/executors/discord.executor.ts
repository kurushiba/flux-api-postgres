import Handlebars from 'handlebars';
import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';
import { formatOutputForMessage } from './format-output';

export async function discordExecutor(
  node: WorkflowNode,
  previousOutput: unknown
): Promise<unknown> {
  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const webhookUrl = params.webhookUrl ?? '';
  if (!webhookUrl) throw new Error('Discord webhook URL is not configured');

  const context = { previousOutput: formatOutputForMessage(previousOutput) };
  const raw = Handlebars.compile(params.message ?? '')(context);
  // Discord の content フィールドは 2000 文字以内の制限がある
  const message = raw.length > 2000 ? raw.slice(0, 1997) + '...' : raw;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.text();
    throw new Error(`Discord webhook error: ${err}`);
  }

  return { success: true, message };
}
