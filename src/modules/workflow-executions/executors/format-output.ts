/**
 * Converts an arbitrary executor output into a human-readable string
 * suitable for use in messaging platforms (Slack, Discord).
 *
 * Priority:
 *  1. If the value is already a string, return it directly.
 *  2. If the value is an object with a top-level `message` string property
 *     (the shape returned by AI nodes), return that string.
 *  3. Otherwise, fall back to JSON.stringify so no information is lost.
 */
export function formatOutputForMessage(output: unknown): string {
  if (typeof output === 'string') {
    return output;
  }

  if (
    output !== null &&
    typeof output === 'object' &&
    'message' in output &&
    typeof (output as Record<string, unknown>).message === 'string'
  ) {
    return (output as Record<string, unknown>).message as string;
  }

  return JSON.stringify(output ?? {});
}
