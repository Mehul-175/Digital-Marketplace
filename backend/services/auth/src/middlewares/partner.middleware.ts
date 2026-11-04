import { Request, Response, NextFunction } from "express"
import redis from "../../../../shared/redis/redis.js"
import User from "../models/user.model.js";
import { IUserSession } from "../types/express.js";


const partnerMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const sessionId = req.cookies?.sessionId
        if(!sessionId) return res.status(401).json({message: "Unauthorized"})
        const userSession = await redis.get(`session:${sessionId}`)
        if(!userSession) return res.status(401).json({message: "Session Expired"})
        const user = JSON.parse(userSession) as IUserSession
        req.user = user
        next()

        
    }catch(error){
    res.status(500).json({message: "Something went wrong while authenticating"})
    }
}


export default partnerMiddleware