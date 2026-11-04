
export interface IUserSession {
  userId: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserSession;
    }
  }
}