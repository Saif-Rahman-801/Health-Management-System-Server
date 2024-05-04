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

const getAllDoctors = asyncHandler(async(req, res) => {
  
})

export { isPatientTrue };
