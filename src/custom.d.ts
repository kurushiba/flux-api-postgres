import { User } from '@blocknote/core/comments';

declare global {
  namespace Express {
    interface Request {
      currentUser: User;
      file?: Express.Multer.File;
    }
  }
}
