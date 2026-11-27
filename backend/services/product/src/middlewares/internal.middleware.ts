import { NextFunction, Request, Response } from "express";

export const internalOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const expectedSecret = process.env.INTERNAL_SECRET;
    const providedSecret = req.header("x-internal-secret"); 

    if (
      !expectedSecret ||
      !providedSecret ||
      providedSecret !== expectedSecret
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server Error verifying internal secret" });
  }
};
