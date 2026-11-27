import { Router } from "express";
import { internalUpdateSales } from "../controllers/internal.controller.js";
import { internalOnly } from "../middlewares/internal.middleware.js";


const router = Router();
router.use(internalOnly)


router.patch('/partner/:partnerId/sales', internalUpdateSales)

export default router;