import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';

export async function openaiExecutor(
  node: WorkflowNode,
  previousOutput: unknown,
  apiKey?: string
): Promise<unknown> {
  if (!apiKey) throw new Error('OpenAI API key is not configured');

  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const model = params.model ?? 'gpt-4o-mini';
  const prompt = params.prompt ?? '';

  const systemContent = previousOutput
    ? `Previous output: ${JSON.stringify(previousOutput)}`
    : undefined;

  const messages: { role: string; content: string }[] = [];
  if (systemContent) messages.push({ role: 'system', content: systemContent });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json() as {
    choices?: { message?: { content?: string } }[];
  };
  return { message: data.choices?.[0]?.message?.content ?? '' };
}
