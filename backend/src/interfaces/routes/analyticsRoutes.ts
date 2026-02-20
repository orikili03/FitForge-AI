import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { AnalyticsController } from "../controllers/analyticsController";

const router = Router();
const controller = new AnalyticsController();

router.get("/progress", authMiddleware, controller.progress);

export { router as analyticsRouter };

