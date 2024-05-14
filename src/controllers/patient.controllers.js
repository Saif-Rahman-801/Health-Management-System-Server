import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
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
    const doctors = await Doctor.aggregate([
      {
        $match: {
          experience: { $gte: parseInt(experience) },
          degrees: degree,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "appointmentEmail",
          foreignField: "email",
          as: "profile",
        },
      },
      {
        $addFields: {
          profile: {
            $arrayElemAt: ["$profile", 0],
          },
        },
      },
      {
        $project: {
          "profile.password": 0,
          "profile.refreshToken": 0,
        },
      },
    ]);

    if (!doctors) {
      throw new ApiError(400, "error while fetching users");
    }

    if (doctors.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "No users found matching the criteria"));
    }

    // console.log(users);
    res
      .status(200)
      .json(
        new ApiResponse(200, { data: doctors }, "users fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAllDoctors = asyncHandler(async (req, res) => {
  try {
    const doctors = await User.aggregate([
      {
        $match: {
          role: "doctor",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "email",
          foreignField: "appointmentEmail",
          as: "docInfo",
        },
      },
      {
        $unwind: "$docInfo",
      },
      {
        $match: {
          "docInfo.verified": true,
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          "docInfo.upcomingAppointments": 0,
        },
      },
    ]);

    if (!doctors) {
      throw new ApiError(500, "Fetching doctors failed");
    }

    res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const requestAppointment = asyncHandler(async (req, res) => {
  try {
    const {
      appointmentDate,
      appointmentTime,
      doctorRegistrationId,
      doctorAppointmentEmail,
    } = req?.body;

    
    if (
      !appointmentDate ||
      !doctorRegistrationId ||
      !doctorAppointmentEmail ||
      !appointmentTime
    ) {
      throw new ApiError(
        500,
        "Cannot schedule appointment without date/time, doctor's registration ID, and doctor's appointment email"
      );
    }

   /*  if (!appointmentDate) {
      throw new ApiError(500, "Cannot schedule appointment without date");
    }
    if (!appointmentTime) {
      throw new ApiError(500, "Cannot schedule appointment without time");
    }
    if (!doctorRegistrationId) {
      throw new ApiError(
        500,
        "Cannot schedule appointment without doctors Registration Id"
      );
    }
    if (!doctorAppointmentEmail) {
      throw new ApiError(
        500,
        "Cannot schedule appointment without doctor Appointment Email"
      );
    } */


    const user = req?.user;


    const createAppointment = await Appointment.create({
      patientId: user ? user._id : null,
      patientName: user ? user.username : null,
      patientEmail: user ? user.email : null,
      doctorRegistrationId,
      doctorAppointmentEmail,
      appointmentDate,
      appointmentTime,
    });

    const requestedAppointment = await Appointment.findById(
      createAppointment?._id
    );

    if (!requestedAppointment) {
      throw new ApiError(500, "Error while creating appointment Request");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requestedAppointment,
          "Appointment request sent successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export {
  isPatientTrue,
  searchDoctors,
  getAllDoctors,
  sortDoctorByExperienceAndDegrees,
  requestAppointment,
};
