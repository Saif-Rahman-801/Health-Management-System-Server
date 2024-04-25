import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

export const updateAccountStatus = async (
  id,
  isActive,
  res,
  successMessage
) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, updatedUser, successMessage));
  } catch (error) {
    throw new ApiError(404, `User not found ${error.message}`);
  }
};
