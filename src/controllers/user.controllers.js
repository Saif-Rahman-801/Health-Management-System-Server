import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // check if the user exists
  const { username, email, role, password } = req.body;

  if ([username, email, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(400, "User already exists");

  //   check if the profile picture file path exists
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);

//   if (!avatar) throw new ApiError(400, "Error uploading avatar");

  //   Create user
  const user = await User.create({
    email,
    password,
    username,
    role,
    // avatar,
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Error while creating user");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registration successful"));
});

export { registerUser };
