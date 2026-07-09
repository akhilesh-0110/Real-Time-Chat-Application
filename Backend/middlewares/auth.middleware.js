import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { catchAsyncError } from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const {token} = req.cookies;
    if (!token) {
        return (
            res.status(401).json({
                success:false,
                message: "user not authenticated, please sign in",
            })
        );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if(!decoded) {
        return res.status(500).json({
            success: false,
            message: "Token verified failed , please sign in again",

        });
    }

    const user = await  User.findById(decoded.id);
    req.user = user;
    next();
}); 