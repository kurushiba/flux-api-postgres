import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';

export async function geminiExecutor(
  node: WorkflowNode,
  previousOutput: unknown,
  apiKey?: string
): Promise<unknown> {
  if (!apiKey) throw new Error('Gemini API key is not configured');

  const params = node.parameters ? (JSON.parse(node.parameters) as Record<string, string>) : {};
  const model = params.model ?? 'gemini-1.5-flash';
  const prompt = params.prompt ?? '';

  const text = previousOutput
    ? `Context: ${JSON.stringify(previousOutput)}\n\n${prompt}`
    : prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return { message: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
}
