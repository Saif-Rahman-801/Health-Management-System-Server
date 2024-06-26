import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendNodeMailerMail } from "../utils/sendNodemailerMail.js";
import crypto from "crypto";

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

  // check if admin already exists
  const adminExists = await User.exists({ role: "admin" });

  if (adminExists && role === "admin") {
    throw new ApiError(400, "admin already exists");
  }

  //   check if the profile picture file path exists
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);

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

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found; no user with this email");
  }
  const resetToken = await user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const url = `${process.env.FRONTEND_URL}/resetPass/${resetToken}`;

  const message = `Copy the token ${resetToken} and paste it in the confirmation token to reset your password or fetch ${url} with a PUT request. if you haven't requested to reset your password then ignore the mail.`;

  await sendNodeMailerMail(user?.email, "Reset your password", message);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Reset password token has been sent to ${user?.email} Mailtrap  account; Please Check your Mailtrap account inbox`
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  // hit the backend api endpoint hostedLink/resetPass/:token with new password in the body
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  user.password = req?.body?.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
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

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassWord,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
