import { ApiError } from "../utils/ApiError.js";

export const isDoctor = (req, _, next) => {
    if (req?.user?.role !== "doctor") {
      throw new ApiError(403, "Unauthorized; Bad request, role doesn't match");
    }
    next();
};