import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(401, "Invalid user token");
    }
    // console.log(decodedToken);
    /* 
    the decoded token looks like 
    decodedToken = {
    "_id": "60f23c9d7a3b1935a875d71f", // Example user ID
    "email": "example@example.com", // Example email
    "username": "example_username", // Example username
    "iat": 1649159267, // Issued at (timestamp)
    "exp": 1649162867 // Expiry (timestamp)
    }
     */

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // frontend discuss
      throw new ApiError(401, "Invalid user token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const isUserAvailable = (req, _, next) => {
  if (!req?.user) {
    throw new ApiError(401, "Unauthorized; user not available");
  }
  next();
};

export const isAdmin = (req, _, next) => {
  if (req?.user?.role !== "admin") {
    throw new ApiError(403, "Unauthorized; Bad request, role doesn't match");
  }
  next();
};
