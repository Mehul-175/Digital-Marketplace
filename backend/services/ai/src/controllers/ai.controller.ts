import { Request, Response } from "express";
import { AnalyticsData } from "../types/analytics.types.js";
import redis from "../../../../shared/redis/redis.js";
import { runAnalyticsAgent } from "../agents/analytics.agent.js";

export const getAIAnalysis = async (req: Request, res: Response) => {
  try {
    const partnerId = req.headers["x-user-id"];

    if (!partnerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const analyticsData = req.body as AnalyticsData;

    const cachedData = await redis.get(`ai:${partnerId}`);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        AIAnalysis: JSON.parse(cachedData),
        ExpiresIn: await redis.ttl(`ai:${partnerId}`),
        message: "AI analysis successful",
        cached: true
      });
    }

    const aiResponse = await runAnalyticsAgent(analyticsData);

    const productPerformance = analyticsData.products.map(product => ({
      productId: product.id,
      product: product.title,
      sales: product.totalSales,
      revenue: product.totalRevenue,
    }));

    const revenueMap: Record<string, number> = {};

    analyticsData.orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];

      revenueMap[date] = (revenueMap[date] ?? 0) + order.partnerAmount;
    });

    const revenueTrend = Object.entries(revenueMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date,
        revenue,
      }));

    const salesMap: Record<string, number> = {};

    analyticsData.orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];

      salesMap[date] = (salesMap[date] ?? 0) + 1;
    });

    const salesTrend = Object.entries(salesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sales]) => ({
        date,
        sales,
      }));

    const result = {
      summary: analyticsData.summary,

      charts: {
        productPerformance,

        revenueTrend,

        salesTrend,
      },

      aiResponse,
    };

    await redis.set(`ai:${partnerId}`, JSON.stringify(result), "EX", 60 * 10);

    return res.status(200).json({
      success: true,

      cached: false,

      expiresIn: await redis.ttl(`ai:${partnerId}`),

      message: "AI analysis successful",

      AIAnalysis: result,
    });
  } catch (error) {
    console.error("AI Analytics Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to generate AI analytics",
    });
  }
};
