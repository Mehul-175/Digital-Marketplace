import { Router } from "express";
import { internalOnly } from "../middlewares/internal.middleware.js";
import { internalGetProduct, internalUpdateSales } from "../controllers/internal.controller.js";


const internalRouter = Router();
internalRouter.use(internalOnly)

internalRouter.get("/products/:id", internalGetProduct);
internalRouter.patch("/products/:id/sales", internalUpdateSales)

export default internalRouter;