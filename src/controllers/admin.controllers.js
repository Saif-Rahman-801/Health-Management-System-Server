import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAdminTrue = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req?.user,
        adminRole: true,
      },
      "role authorized"
    )
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    res
      .status(200)
      .json(
        new ApiResponse(200, { users }, "users fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, `server error while fetching users; ${error.message}`);
  }
});

export { isAdminTrue, getAllUsers };
