import { Request, Response } from "express";
import User from "../models/user.model.js";
import redis from "../../../../shared/redis/redis.js";
import mongoose from "mongoose";

export const internalUpdateSales = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const { amount } = req.body;

    if (!mongoose.isValidObjectId(partnerId)) {
        return res.status(400).json({ message: "Invalid product id" });
    }   
    if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    const partner = await User.findByIdAndUpdate(partnerId, {$inc: {totalSales: 1, totalRevenue: amount}});
    if (!partner) return res.status(404).json({ message: "Partner not found" });


    await redis.del("public:partners");
    await redis.del(`partner:${partnerId}`);

    return res
      .status(200)
      .json({
        message: "Partner sales updated successfully"
      });
  } catch (error) {
    return res.status(500).json({ message: "failed to update partner sales" });
  }
};