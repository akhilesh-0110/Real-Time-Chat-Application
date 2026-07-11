import jwt from "jsonwebtoken";

export const generateJWTToken = async(user, message, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    return res
    .status(statusCode)
    .cookie("token", token, {
        maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
    })
    .json({
        success: true,
        message,
        token,
        user,
    });
};