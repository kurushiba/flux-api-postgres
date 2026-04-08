import Handlebars from 'handlebars';
import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';
import { formatOutputForMessage } from './format-output';

export async function slackExecutor(
  node: WorkflowNode,
  previousOutput: unknown
): Promise<unknown> {
  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const webhookUrl = params.webhookUrl ?? '';
  if (!webhookUrl) throw new Error('Slack webhook URL is not configured');

  const context = { previousOutput: formatOutputForMessage(previousOutput) };
  const message = Handlebars.compile(params.message ?? '')(context);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Slack webhook error: ${err}`);
  }

  return { success: true, message };
}
