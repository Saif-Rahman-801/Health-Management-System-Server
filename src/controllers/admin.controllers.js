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
    if (!users) {
      throw new ApiError(400, "error while fetching users");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { users }, "users fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `server error while fetching users; ${error.message}`
    );
  }
});

const searchUser = asyncHandler(async (req, res) => {
  const { username } = req?.query;
  try {
    if (!username) {
      throw new ApiError(401, "Can't search without a name");
    }

    const users = await User.find({
      username: new RegExp(username, "i"), // Performs a case-insensitive search
    });

    if (users.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "No users found matching the criteria"));
    }

    // console.log(users);

    if (!users) {
      throw new ApiError(400, "error while fetching users");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, { data: users }, "users fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, `${error.message}`);
  }
});

const sortUser = asyncHandler(async (req, res) => {
  const { role } = req?.query;
  if (!role) {
    throw new ApiError(500, "can't sort users without role");
  }
  try {
    const users = await User.find({ role: role }).sort({ role: 1 });

    if (!users) {
      throw new ApiError(400, "error while fetching users");
    }

    if (users.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "No users found matching the criteria"));
    }

    // console.log(users);
    res
      .status(200)
      .json(
        new ApiResponse(200, { data: users }, "users fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAUser = asyncHandler(async (req, res) => {
  const { id } = req?.query;
  if (!id) {
    throw new ApiError(500, "User unavaible; id doesn't match");
  }

  try {
    const user = await User.findById(id, "-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "user is not availbale");
    }
    res
      .status(200)
      .json(new ApiResponse(200, { data: user }, "user fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message);
  }
});

export { isAdminTrue, getAllUsers, searchUser, sortUser, getAUser };
