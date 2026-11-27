import { Request, Response } from "express";
import User from "../models/user.model.js";
import redis from "../../../../shared/redis/redis.js";

export const getPartner = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const cachedPartner = await redis.get(`partner:${userId}`);

    if (cachedPartner) {
      return res.status(200).json({
        partner: JSON.parse(cachedPartner),
        data: "from cache",
      });
    }
    const partner = await User.findById(userId);

    if (!partner) return res.status(404).json({ message: "Partner not found" });

    await redis.set(
      `partner:${userId}`,
      JSON.stringify(partner),
      "EX",
      60 * 60 * 24 * 7,
    );

    res.status(200).json({
      data: "from db",
      partner,
    });
  } catch (error) {
    res.status(500).json({ message: "failed to get partner" });
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const partner = await User.findById(userId);

    if (!partner) return res.status(404).json({ message: "Partner not found" });

    const { name, partnerProfile, paymentDetails } = req.body;

    if (name !== undefined) partner.name = name.trim();

    if (partnerProfile) {
      const currentSlug = partner.partnerProfile?.slug?.trim() || "";
      const newSlug = partnerProfile.slug?.trim().toLowerCase();

      if (currentSlug) {
        if (newSlug && newSlug !== currentSlug) {
          return res.status(409).json({
            field: "slug",
            message: "Profile slug cannot be changed once created",
          });
        }
      } else {
        if (!newSlug) {
          return res.status(400).json({
            field: "slug",
            message: "Slug cannot be empty",
          });
        }

        //Check if slug already exists
        const existingPartner = await User.findOne({
          "partnerProfile.slug": newSlug,
          _id: { $ne: partner._id },
        });

        if (existingPartner)
          return res.status(409).json({
            field: "slug",
            message: "This profile slug is already taken",
          });
      }

      partner.partnerProfile = {
        slug: currentSlug || newSlug,
        bio: partnerProfile.bio?.trim() ?? partner.partnerProfile.bio ?? "",
        website:
          partnerProfile.website?.trim() ??
          partner.partnerProfile.website ??
          "",
        socialLinks: {
          youtube:
            partnerProfile.socialLinks?.youtube?.trim() ??
            partner.partnerProfile.socialLinks?.youtube ??
            "",
          instagram:
            partnerProfile.socialLinks?.instagram?.trim() ??
            partner.partnerProfile.socialLinks?.instagram ??
            "",
          linkedin:
            partnerProfile.socialLinks?.linkedin?.trim() ??
            partner.partnerProfile.socialLinks?.linkedin ??
            "",
          github:
            partnerProfile.socialLinks?.github?.trim() ??
            partner.partnerProfile.socialLinks?.github ??
            "",
        },
      };
    }

    if (paymentDetails) {
      partner.paymentDetails = {
        method: paymentDetails.method ?? partner.paymentDetails.method ?? "upi",
        upiId:
          paymentDetails.upiId?.trim() ?? partner.paymentDetails.upiId ?? "",
        accountHolderName:
          paymentDetails.accountHolderName?.trim() ??
          partner.paymentDetails.accountHolderName ??
          "",
        accountNumber:
          paymentDetails.accountNumber?.trim() ??
          partner.paymentDetails.accountNumber ??
          "",
        ifscCode:
          paymentDetails.ifscCode?.trim() ??
          partner.paymentDetails.ifscCode ??
          "",
      };
    }

    await partner.save();

    const updatedSession = {
      userId: partner._id,
      name: partner.name,
      email: partner.email,
      role: partner.role,
    };
    await redis.set(
      `session:${req.cookies?.sessionId}`,
      JSON.stringify(updatedSession),
      "KEEPTTL",
    );

    const updatedPartner = partner.toObject();

    await redis.set(
      `partner:${userId}`,
      JSON.stringify(updatedPartner),
      "EX",
      60 * 60 * 24 * 7,
    );

    res.status(200).json({
      message: "Partner profile updated successfully",
      partner: updatedPartner,
    });
  } catch (error: any) {
    if (error?.code === 11000)
      return res
        .status(409)
        .json({ field: "slug", message: "This profile slug is already taken" });
    res.status(500).json({ message: "failed to update partner profile" });
  }
};

export const getAllPublicPartner = async (req: Request, res: Response) => {
  try {
    //from cache
    const cachedData = await redis.get("public:partners");
    if (cachedData)
      return res
        .status(200)
        .json({ partners: JSON.parse(cachedData), source: "cache" });

    //from mongodb
    const partners = await User.find({
      role: "partner",
      isActive: true,
      "partnerProfile.slug": { $ne: "", $exists: true },
    }).select("name partnerProfile isActive totalSales");

    await redis.set("public:partners", JSON.stringify(partners), "EX", 60 * 10);

    res.status(200).json({ partners, source: "db" });
  } catch (error) {
    res.status(500).json({ message: "failed to get partner" });
  }
};
