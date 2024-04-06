import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // get the user to generate token for each user
    const user = await User.findById(userId);

    // generate token using the methods you created in the user.model.js
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save the user with refresh token in the db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // it disables the validation checks defined in your schema before saving the document to the database.

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access or refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // check if the user exists
  const { username, email, role, password } = req.body;

  if ([username, email, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    email,
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

  //   Create user
  const user = await User.create({
    email,
    password,
    username,
    role,
    avatar: avatar?.url,
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Error while creating user");
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registration successful"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if the user exists or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user doesn't exists");
  }

  // check if the password matches
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password Doesn't match");
  }

  // generate and get the jwt tokens to set them in the cookie
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  // get the logged in user
  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  // send the response with setting the jwt in the cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req?.user?._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    const options = { httpOnly: true, secure: true };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const changeCurrentPassWord = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req?.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Your password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    res
      .status(200)
      .json(
        new ApiResponse(200, req?.user, "current user fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, `user fetch failed, ${error.message}`);
  }
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassWord,
  getCurrentUser,
};
