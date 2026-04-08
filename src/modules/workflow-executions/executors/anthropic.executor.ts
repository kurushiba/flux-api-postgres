import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';

export async function anthropicExecutor(
  node: WorkflowNode,
  previousOutput: unknown,
  apiKey?: string
): Promise<unknown> {
  if (!apiKey) throw new Error('Anthropic API key is not configured');

  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const model = params.model ?? 'claude-haiku-4-5-20251001';
  const prompt = params.prompt ?? '';

  const userContent = previousOutput
    ? `Context: ${JSON.stringify(previousOutput)}\n\n${prompt}`
    : prompt;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  const data = await response.json() as {
    content?: { type: string; text?: string }[];
  };
  return { message: data.content?.[0]?.text ?? '' };
}
