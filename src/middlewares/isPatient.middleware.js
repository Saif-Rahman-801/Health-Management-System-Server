import { ApiError } from "../utils/ApiError.js";

export const isPatient = (req, _, next) => {
  if (req?.user?.role !== "patient") {
    throw new ApiError(403, "Unauthorized; Bad request, role doesn't match");
  }
  next();
};
