import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import datasource from '../../datasource';
import { Workflow } from './workflow.entity';
import { WorkflowNode } from '../workflow-nodes/workflow-node.entity';
import { WorkflowEdge } from '../workflow-edges/workflow-edge.entity';

const workflowsController = Router();
const workflowRepository = datasource.getRepository(Workflow);
const workflowNodeRepository = datasource.getRepository(WorkflowNode);
const workflowEdgeRepository = datasource.getRepository(WorkflowEdge);

// GET /workflows
workflowsController.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const workflows = await workflowRepository.find({
      where: { userId: req.currentUser.id },
      order: { updatedAt: 'DESC' },
    });
    res.json(workflows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// POST /workflows
workflowsController.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const { name } = req.body;
    const workflowId = crypto.randomUUID();
    const workflow = await workflowRepository.save({
      id: workflowId,
      name,
      userId: req.currentUser.id,
    });
    // INITIAL ノードを自動生成
    await workflowNodeRepository.save({
      id: crypto.randomUUID(),
      workflowId,
      type: 'INITIAL' as const,
      label: 'Start',
      positionX: 250,
      positionY: 200,
      parameters: null,
      credentialId: null,
    });
    res.status(201).json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// GET /workflows/:id
workflowsController.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const workflow = await workflowRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser.id },
    });
    if (!workflow) {
      res.status(404).json({ message: 'ワークフローが見つかりません' });
      return;
    }
    const nodes = await workflowNodeRepository.find({
      where: { workflowId: req.params.id },
    });
    const edges = await workflowEdgeRepository.find({
      where: { workflowId: req.params.id },
    });
    res.json({ ...workflow, nodes, edges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// PATCH /workflows/:id
workflowsController.patch('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const workflow = await workflowRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser.id },
    });
    if (!workflow) {
      res.status(404).json({ message: 'ワークフローが見つかりません' });
      return;
    }
    const { name, nodes, edges } = req.body;
    if (name !== undefined) workflow.name = name;
    const updated = await workflowRepository.save(workflow);

    if (nodes !== undefined && edges !== undefined) {
      // 全削除 → 再挿入
      await workflowNodeRepository.delete({ workflowId: req.params.id });
      await workflowEdgeRepository.delete({ workflowId: req.params.id });
      if (nodes.length > 0) {
        await workflowNodeRepository.save(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodes.map((n: any) => ({ ...n, workflowId: req.params.id }))
        );
      }
      if (edges.length > 0) {
        await workflowEdgeRepository.save(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          edges.map((e: any) => ({ ...e, workflowId: req.params.id }))
        );
      }
    }

    const savedNodes = await workflowNodeRepository.find({
      where: { workflowId: req.params.id },
    });
    const savedEdges = await workflowEdgeRepository.find({
      where: { workflowId: req.params.id },
    });
    res.json({ ...updated, nodes: savedNodes, edges: savedEdges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// DELETE /workflows/:id
workflowsController.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    await workflowRepository.delete({
      id: req.params.id,
      userId: req.currentUser.id,
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default workflowsController;
