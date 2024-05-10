import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isPatientTrue = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req?.user,
        patientRole: true,
      },
      "role authorized"
    )
  );
});

const searchDoctors = asyncHandler(async (req, res) => {
  const { username } = req?.query;

  try {
    if (!username) {
      throw new ApiError(401, "Can't search without a name");
    }

    const users = await User.aggregate([
      {
        $match: {
          username: new RegExp(username, "i"),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "email",
          foreignField: "appointmentEmail",
          as: "DoctorInfo",
        },
      },
      {
        $unwind: "$DoctorInfo",
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          upcomingAppointments: 0,
        },
      },
    ]);

    if (users.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "No users found matching the criteria"));
    }


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

const sortDoctorByExperienceAndDegrees = asyncHandler(async (req, res) => {
  const { experience, degree } = req?.query;
  if (!experience && !degree) {
    throw new ApiError(500, "can't sort doctors without experience or degree");
  }
  try {
    // const users = await User.find({ role: role }).sort({ role: 1 });
    const users = await Doctor.aggregate([
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

export { isPatientTrue, searchDoctors };
