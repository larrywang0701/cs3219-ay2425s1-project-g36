import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";

import User from "../models/userModel";
import { JWT_SECRET } from "../../utils/config";

/**
 * Middleware that verifies that a user is logged in as an admin before proceeding.
 * 
 * Needs to be performed with `protectRoute` that checks if a user is logged in.
 */
export const adminProtectRoute = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized to access this resource" });
    }
};