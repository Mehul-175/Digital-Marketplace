import express from "express"
import { getAIAnalysis } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post("/analytics", getAIAnalysis);

export default aiRouter;