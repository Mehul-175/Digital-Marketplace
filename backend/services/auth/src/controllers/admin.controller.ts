import { Request, Response } from "express";
import User from "../models/user.model.js";

export const getAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await User.findOne({
      role: "admin",
      isActive: true,
    })
      .select("name email")
      .lean();

    if (!admin) return res.status(400).json({ message: "Admin not found" });

    res.status(200).json({
      admin: {
        name: admin.name,
        email: admin.email,
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "failed to get admin" });
  }
};
