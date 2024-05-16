import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isDoctorTrue = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req?.user,
        doctorRole: true,
      },
      "role authorized"
    )
  );
});

const verifyAsDoctor = asyncHandler(async (req, res) => {
  const {
    username,
    registrationId,
    degrees,
    collegeName,
    appointmentEmail,
    phoneNumber,
    experience,
  } = req.body;

  const isVerificationRequestAlreadyExists = await Doctor.findOne({
    registrationId,
  });

  if (!isVerificationRequestAlreadyExists) {
    throw new ApiError(500, "Verification request already sent");
  }

  const requiredFields = [
    { field: username, message: "Please provide your username" },
    { field: registrationId, message: "Please provide your registration Id" },
    { field: degrees, message: "Please provide your degrees" },
    { field: collegeName, message: "Please provide your college name" },
    {
      field: appointmentEmail,
      message: "Please provide your appointment email",
    },
    { field: phoneNumber, message: "Please provide your phone number" },
    {
      field: experience,
      message:
        "Please provide your experience information if it's 0 years give 0",
    },
  ];

  requiredFields.forEach(({ field, message }) => {
    if (!field) {
      throw new ApiError(400, message);
    }
  });

  const _id = registrationId;
  const doctorExists = await User.findOne({ _id }).select(
    "-password -refreshToken"
  );

  // console.log(doctorExists);

  if (!doctorExists) {
    throw new ApiError(401, "Unauthorized: User does not exists");
  }

  if (doctorExists.role !== "doctor") {
    throw new ApiError(401, "Unauthorized: User does not have a doctor role");
  }

  if (doctorExists.email !== appointmentEmail) {
    throw new ApiError(
      500,
      "Your appointment email should match your registration email"
    );
  }

  try {
    const doctor = await Doctor.create({
      username,
      registrationId,
      degrees,
      collegeName,
      appointmentEmail,
      phoneNumber,
      experience,
    });

    const verifiedDoctor = await Doctor.findById(doctor?._id);
    // console.log(verifiedDoctor);

    if (!verifiedDoctor) throw new ApiError(500, "Error while creating user");

    return res
      .status(200)
      .json(
        new ApiResponse(200, verifiedDoctor, "Doctor verification request sent")
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const requestedAppointments = asyncHandler(async (req, res) => {
  try {
    const doctorRegistrationId = req?.user?._id;

    const requestedAppointments = await Appointment.aggregate([
      {
        $match: {
          doctorRegistrationId: new mongoose.Types.ObjectId(
            doctorRegistrationId
          ),
        },
      },
      {
        $match: {
          accepted: false,
        },
      },
    ]);

    if (!requestedAppointments) {
      throw new ApiError(500, "Error while fetching requested   Appointments");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requestedAppointments,
          "appointment requests fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const acceptAppointment = asyncHandler(async (req, res) => {
  try {
    const appoitmentId = req?.query?.appoitmentId;

    if (!appoitmentId) {
      throw new ApiError(500, "appoitment id missing");
    }

    const isAlreadyAccepted = await Appointment.findById({ _id: appoitmentId });

    if (isAlreadyAccepted?.accepted) {
      throw new ApiError(500, "Appointment has already been accepted");
    }

    const acceptAppointment = await Appointment.findOneAndUpdate(
      { _id: appoitmentId },
      { $set: { accepted: true, canceled: false } },
      { new: true }
    );

    if (!acceptAppointment) {
      throw new ApiError(500, "Error while accepting appointment");
    }

    res
      .status(200)
      .json(new ApiResponse(200, acceptAppointment, "Appointment accepted"));
  } catch (error) {
    throw new ApiError(200, error.message);
  }
});

const cancelAppointment = asyncHandler(async (req, res) => {
  try {
    const appoitmentId = req?.query?.appoitmentId;

    if (!appoitmentId) {
      throw new ApiError(500, "appoitment id missing");
    }

    const isAlreadyCanceled = await Appointment.findById({ _id: appoitmentId });

    if (isAlreadyCanceled?.canceled) {
      throw new ApiError(500, "Appointment has already been canceled");
    }

    const cancelAppointment = await Appointment.findOneAndUpdate(
      { _id: appoitmentId },
      { $set: { accepted: false, canceled: true } },
      { new: true }
    );

    if (!cancelAppointment) {
      throw new ApiError(500, "Error while accepting appointment");
    }

    res
      .status(200)
      .json(new ApiResponse(200, cancelAppointment, "Appointment canceled"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getYourCanceledAppointments = asyncHandler(async (req, res) => {
  try {
    const doctorRegistrationId = req?.user?._id;

    const canceledAppointments = await Appointment.find({
      $and: [{ doctorRegistrationId }, { canceled: true }, { accepted: false }],
    });

    if (!canceledAppointments) {
      throw new ApiError(500, "Don't have any canceled appointments");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          500,
          canceledAppointments,
          "Canceled appoitments fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export {
  isDoctorTrue,
  verifyAsDoctor,
  requestedAppointments,
  acceptAppointment,
  cancelAppointment,
  getYourCanceledAppointments
};
