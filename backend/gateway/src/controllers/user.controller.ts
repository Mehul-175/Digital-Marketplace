import { Request, Response } from "express"
export const getCurrentUser = async (req:Request, res: Response) => {
    try {
        res.status(200).json({ user: req.user })
    } catch (error) {
        res.status(500).json({message: "Error fetching CurrentUser"})
    }
}