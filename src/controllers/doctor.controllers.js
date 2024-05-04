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
    registrationId,
    degrees,
    collegeName,
    appointmentEmail,
    phoneNumber,
  } = req.body;

  const requiredFields = [
    { field: registrationId, message: "Please provide your registration Id" },
    { field: degrees, message: "Please provide your degrees" },
    { field: collegeName, message: "Please provide your college name" },
    {
      field: appointmentEmail,
      message: "Please provide your appointment email",
    },
    { field: phoneNumber, message: "Please provide your phone number" },
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

  try {
    const doctor = await Doctor.create({
      registrationId,
      degrees,
      collegeName,
      appointmentEmail,
      phoneNumber,
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

export { isDoctorTrue, verifyAsDoctor };
