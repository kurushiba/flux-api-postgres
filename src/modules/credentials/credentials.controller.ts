import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import datasource from '../../datasource';
import { Credential } from './credential.entity';
import { encrypt } from '../../common/encryption';

const credentialsController = Router();
const credentialRepository = datasource.getRepository(Credential);

// GET /credentials
credentialsController.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const credentials = await credentialRepository.find({
      where: { userId: req.currentUser.id },
      order: { createdAt: 'DESC' },
    });
    res.json(credentials.map(({ encryptedData: _, ...rest }) => rest));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// POST /credentials
credentialsController.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const { name, type, data } = req.body;
    const encryptedData = encrypt(JSON.stringify(data));
    const credential = await credentialRepository.save({
      id: crypto.randomUUID(),
      name,
      type,
      encryptedData,
      userId: req.currentUser.id,
    });
    const { encryptedData: _, ...result } = credential;
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// PATCH /credentials/:id
credentialsController.patch('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    const credential = await credentialRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser.id },
    });
    if (!credential) {
      res.status(404).json({ message: 'クレデンシャルが見つかりません' });
      return;
    }
    const { name, type, data } = req.body;
    if (name) credential.name = name;
    if (type) credential.type = type;
    if (data) credential.encryptedData = encrypt(JSON.stringify(data));
    const updated = await credentialRepository.save(credential);
    const { encryptedData: _, ...result } = updated;
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// DELETE /credentials/:id
credentialsController.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }
    await credentialRepository.delete({
      id: req.params.id,
      userId: req.currentUser.id,
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default credentialsController;
