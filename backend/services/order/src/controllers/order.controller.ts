import { Request, Response } from "express";
import { razorpay } from "../configs/razorpay.js";
import Order from "../models/order.model.js";
import { createHmac } from "crypto";
import axios from 'axios'
import redis from "../../../../shared/redis/redis.js"


export const createOrder = async (req: Request, res: Response)=>{
    try {
        const {productId, customerName, customerEmail } = req.body

        if(!productId || !customerName || !customerEmail ){
            return res.status(400).json({
                success:false,
                message:
                "All fields are required"
            });
        }

        let product;
        try {
            const { data } = await axios.get(
                `${process.env.PRODUCT_SERVICE_URL}/internal/products/${productId}`,
                { headers: { "x-internal-secret": process.env.INTERNAL_SECRET as string } }
            );
            product = data.product;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                return res.status(404).json({ message: "Product not foundddddddd" });
            }
            return res.status(502).json({ message: "Product service unavailable" });
        }

        const amount = product.price
        const partnerId = product.partnerId
        const productTitle = product.title
        const links = product.links

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        })

        const order = await Order.create({
            productId,
            partnerId,
            productTitle,
            productPrice: amount,
            customerName,
            customerEmail,
            links,
            razorpayOrderId:
            razorpayOrder.id,
            paymentStatus:
            "pending",
            partnerAmount:
            amount * 0.95,
            adminAmount:
            amount * 0.05
        })

        return res.status(201).json({
            message: "Order created successfully",

            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount,
            key: process.env.RAZORPAY_KEY_ID
        })

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create order"
        })
    }
}



export const verifyPayment = async (req: Request, res: Response)=>{
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
            return res.status(400).json({
                success:false,
                message:
                "Payment details missing"
            });
        }

        const generatedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex")

        if(generatedSignature !== razorpay_signature){
            return res.status(400).json({
                message: "Invalid signature"
            })
        }

        const order = await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id, paymentStatus: "pending" },
            {
                paymentStatus: "success",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            },
            { new: true }
        )
        if (!order) {
            const existing = await Order.findOne({ razorpayOrderId: razorpay_order_id });

            if (!existing) {
                return res.status(404).json({ message: "Order not found" });
            }

            return res.status(200).json({ message: "Payment already verified" });
        }

        try {
        await axios.patch(
            `${process.env.PRODUCT_SERVICE_URL}/internal/products/${order.productId}/sales`,
            { amount: order.productPrice },
            { headers: { "x-internal-secret": process.env.INTERNAL_SECRET as string } }
        );
        } catch (err) {
        console.error("Product sales update failed", order._id, err);
        }

        try {
        await axios.patch(
            `${process.env.AUTH_SERVICE_URL}/internal/partner/${order.partnerId}/sales`,
            { amount: order.partnerAmount },
            { headers: { "x-internal-secret": process.env.INTERNAL_SECRET as string } }
        );
        } catch (err) {
        console.error("Parnter sales update failed", order._id, err);
        }

        return res.status(200).json({ message: "Payment verified successfully", order });


    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify payment"
        })
    }
}


export const getAllOrders = async (req: Request, res: Response)=>{
    try {
        const partnerId = req.headers["x-user-id"] as string;
        if (!partnerId) return res.status(401).json({ message: "Unauthorized" });

        //from cache
        const cachedOrders = await redis.get("order:all")
        if(cachedOrders) return res.status(200).json({ message: "Order fetched", orders: JSON.parse(cachedOrders), source: "Cache"})

        //from db
        const orders = await Order.find({ partnerId })
        .select("_id productId partnerId productTitle productPrice customerName customerEmail partnerEmail paymentStatus partnerAmount adminAmount createdAt")
        .sort({ createdAt: -1 });

        await redis.set("order:all", JSON.stringify(orders), "Ex", 600)

        return res.status(200).json({ message: "Order fetched", orders, source: "DB" });
    } catch (error) {
        return res.status(500).json({message: "failed to get orders"})
    }
}