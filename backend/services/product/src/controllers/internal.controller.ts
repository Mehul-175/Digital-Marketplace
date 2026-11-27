import mongoose from "mongoose";
import { Request, Response } from "express";
import Product from "../models/product.model.js";
import redis from "../../../../shared/redis/redis.js";



export const internalGetProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const product = await Product.findOne({_id: id, status: "published"}).select("partnerId title price links")

        if(!product){
            return res.status(404).json({ message: "Product not found" })
        }

        return res.status(200).json({ product })

    } catch (error) {
        return res.status(500).json({ message: "Server Error during internally getting product" })
    } 
}



export const internalUpdateSales = async (req: Request, res: Response)=>{
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }   
        if (typeof amount !== "number" || amount < 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
            
        const product = await Product.findByIdAndUpdate(id, {$inc: {totalSales: 1, totalRevenue: amount}})

        if (!product) return res.status(404).json({ message: "Product not found" });

        await redis.del(`products:${product.partnerId}`);
        await redis.del("public:products");

        return res.status(200).json({ message: "Product sales updated" });
            
    } catch (error) {
        return res.status(500).json({ message: "Server Error during internally updating sales" })
    }
}