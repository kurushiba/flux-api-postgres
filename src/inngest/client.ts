import { Inngest } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime/middleware';

export type ExecutionUpdate =
  | {
      type: 'node';
      executionId: string;
      nodeExecutionId: string;
      nodeId: string;
      nodeName: string;
      status: 'RUNNING' | 'SUCCESS' | 'FAILED';
      outputData: string | null;
      errorMessage: string | null;
    }
  | {
      type: 'execution';
      executionId: string;
      status: 'SUCCESS' | 'FAILED';
    };

// Channel name: execution-{executionId}
export const executionChannelName = (executionId: string) =>
  `execution-${executionId}`;

export const inngest = new Inngest({
  id: 'flux',
  middleware: [realtimeMiddleware()],
});
