import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isDoctorTrue = asyncHandler(async(req, res) => {
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
})

export {isDoctorTrue}