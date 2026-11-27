import { Router } from "express";
import { createOrder, getAllOrders, verifyPayment } from "../controllers/order.controller.js";


const orderRouter = Router();

orderRouter.post("/", createOrder);
orderRouter.post("/verify-payment", verifyPayment);
orderRouter.get("/", getAllOrders)

export default orderRouter;