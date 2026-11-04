import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { app } from "../configs/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../../shared/redis/redis.js";

export const login = async(req: Request, res: Response) => {
    try{
        const { token } = req.body;

        const decoded = await getAuth(app).verifyIdToken(token);
        
        let user = await User.findOne({firebaseUid: decoded.uid})
        if(!user){
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name || "",
                email: decoded.email || "",
            })
        }

        const sessionId = crypto.randomUUID();

        await redis.set(`session:${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }), "EX", 60 * 60 * 24 * 7)
        
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        return res.status(201).json({user})


    }catch(err){
        console.log(err)
        res.status(500).json({message: "Login failed"})
    }
    
}


export const logout = async (req: Request, res: Response) => {
    try {
        const sessionId = req.cookies.sessionId;
        if(sessionId) await redis.del(`session:${sessionId}`)
        res.clearCookie("sessionId",{
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        })
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        res.status(500).json({message: "Logout failed"})
    }
}