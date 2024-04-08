import { ApiError } from "../utils/ApiError.js";

export const isAdmin = (req, _, next) => {
    if (req?.user?.role !== "admin") {
      throw new ApiError(403, "Unauthorized; Bad request, role doesn't match");
    }
    next();
};