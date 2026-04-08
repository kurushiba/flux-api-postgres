import { Router, Request, Response } from 'express';
import { inngest, executionChannelName } from '../../inngest/client';
import { getSubscriptionToken } from '@inngest/realtime';
import { WorkflowExecution } from './workflow-execution.entity';
import { NodeExecution } from '../node-executions/node-execution.entity';
import { Workflow } from '../workflows/workflow.entity';
import datasource from '../../datasource';

// Mounted at /workflows — handles /:id/execute and /:id/executions
export const workflowExecutionsRouter = Router();

// POST /workflows/:id/execute
workflowExecutionsRouter.post('/:id/execute', async (req: Request, res: Response) => {
  const user = (req as Request & { currentUser?: { id: string } }).currentUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const workflowId = req.params.id;
  const triggerData = (req.body as { triggerData?: unknown } | undefined)?.triggerData;

  const workflowRepo = datasource.getRepository(Workflow);
  const workflow = await workflowRepo.findOne({ where: { id: workflowId, userId: user.id } });
  if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

  const executionId = crypto.randomUUID();

  const execRepo = datasource.getRepository(WorkflowExecution);
  await execRepo.save({
    id: executionId,
    workflowId,
    status: 'RUNNING' as const,
    errorMessage: null,
    finishedAt: null,
  });

  await inngest.send({
    name: 'workflow/execute',
    data: { executionId, workflowId, triggerData: triggerData ?? null },
  });

  return res.status(201).json({ executionId });
});

// GET /workflows/:id/executions
workflowExecutionsRouter.get('/:id/executions', async (req: Request, res: Response) => {
  const user = (req as Request & { currentUser?: { id: string } }).currentUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const workflowId = req.params.id;

  const workflowRepo = datasource.getRepository(Workflow);
  const workflow = await workflowRepo.findOne({ where: { id: workflowId, userId: user.id } });
  if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

  const execRepo = datasource.getRepository(WorkflowExecution);
  const executions = await execRepo.find({
    where: { workflowId },
    order: { startedAt: 'DESC' },
  });

  return res.json(executions);
});

// Mounted at /executions — handles /:executionId and /:executionId/realtime-token
export const executionsRouter = Router();

// GET /executions/:executionId
executionsRouter.get('/:executionId', async (req: Request, res: Response) => {
  const user = (req as Request & { currentUser?: { id: string } }).currentUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { executionId } = req.params;

  const execRepo = datasource.getRepository(WorkflowExecution);
  const execution = await execRepo.findOne({ where: { id: executionId } });
  if (!execution) return res.status(404).json({ message: 'Execution not found' });

  // Verify ownership via workflow
  const workflowRepo = datasource.getRepository(Workflow);
  const workflow = await workflowRepo.findOne({
    where: { id: execution.workflowId, userId: user.id },
  });
  if (!workflow) return res.status(404).json({ message: 'Execution not found' });

  const nodeExecRepo = datasource.getRepository(NodeExecution);
  const nodeExecutions = await nodeExecRepo.find({
    where: { workflowExecutionId: executionId },
    order: { startedAt: 'ASC' },
  });

  return res.json({ ...execution, nodeExecutions });
});

// GET /executions/:executionId/realtime-token
executionsRouter.get('/:executionId/realtime-token', async (req: Request, res: Response) => {
  const user = (req as Request & { currentUser?: { id: string } }).currentUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { executionId } = req.params;

  const execRepo = datasource.getRepository(WorkflowExecution);
  const execution = await execRepo.findOne({ where: { id: executionId } });
  if (!execution) return res.status(404).json({ message: 'Execution not found' });

  const workflowRepo = datasource.getRepository(Workflow);
  const workflow = await workflowRepo.findOne({
    where: { id: execution.workflowId, userId: user.id },
  });
  if (!workflow) return res.status(404).json({ message: 'Execution not found' });

  const token = await getSubscriptionToken(inngest, {
    channel: executionChannelName(executionId),
    topics: ['update'],
  });

  return res.json({ token });
});

export default workflowExecutionsRouter;
