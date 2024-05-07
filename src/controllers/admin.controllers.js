import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isNullOrEmpty } from "../utils/isNullOrEmpty.js";
import { updateAccountStatus } from "../utils/updateAccountStatus.js";

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

    // const users = await User.find({
    //   username: new RegExp(username, "i"), // Performs a case-insensitive search
    // });

    const users = await User.aggregate([
      {
        $match: {
          username: new RegExp(username, "i"),
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
        },
      },
    ]);

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
    // const users = await User.find({ role: role }).sort({ role: 1 });
    const users = await User.aggregate([
      {
        $match: {
          role: `${role}`,
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
        },
      },
    ]);

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

const updateRole = asyncHandler(async (req, res) => {
  const { id, role } = req.body;
  if (!id || !role) {
    throw new ApiError(401, "can't update user without user id and role");
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "User role updated successfully")
      );
  } catch (error) {
    throw new ApiError(400, `Error while updating role ${error.message}`);
  }
});

const deactivateAccount = asyncHandler(async (req, res) => {
  const { id } = req?.body;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  await updateAccountStatus(
    id,
    false,
    res,
    "User account deactivated successfully"
  );
});

const activateAccount = asyncHandler(async (req, res) => {
  const { id } = req?.body;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  await updateAccountStatus(
    id,
    true,
    res,
    "User account activated successfully"
  );
});

const verificationPendingDoctors = asyncHandler(async (req, res) => {
  try {
    const unverifiedDoctors = await Doctor.find({ verified: false });

    if (!unverifiedDoctors) {
      throw new ApiError(500, `Failed to fetch unverified doctors`);
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          unverifiedDoctors,
          "Unverified doctors fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to fetch unverified doctors ${error.message}`
    );
  }
});

const confirmDocVerification = asyncHandler(async (req, res) => {
  try {
    const { registrationId } = req.body;
    const user = await User.findOne({ _id: registrationId }).select(
      "-password -refreshToken"
    );
    // console.log(user);

    if (!user) {
      throw new ApiError(
        401,
        "Unauthorized request; registration id doesn't match"
      );
    }

    const doctor = await Doctor.findOne({ registrationId });
    if (!doctor) {
      throw new ApiError(
        403,
        "Forbidden; User is not available in our doctors list"
      );
    }

    // console.log(doctor);

    if (
      isNullOrEmpty(doctor?.appointmentEmail) ||
      doctor?.degrees.length === 0 ||
      isNullOrEmpty(doctor?.collegeName) ||
      isNullOrEmpty(doctor?.phoneNumber)
    ) {
      throw new ApiError(
        500,
        "Error while doctor's verification; all the require fields aren't fulfilled"
      );
    }

    const verificationUpdatedDoctor = await Doctor.findOneAndUpdate(
      { registrationId },
      { $set: { verified: true } },
      { new: true }
    );

    if (!verificationUpdatedDoctor) {
      throw new ApiError(
        500,
        "Internal server error while updating verification"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, verificationUpdatedDoctor, "Doctor's verified")
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error while doctor's verification; ${error.message}`
    );
  }
});

export {
  isAdminTrue,
  getAllUsers,
  searchUser,
  sortUser,
  getAUser,
  updateRole,
  deactivateAccount,
  activateAccount,
  verificationPendingDoctors,
  confirmDocVerification,
};
