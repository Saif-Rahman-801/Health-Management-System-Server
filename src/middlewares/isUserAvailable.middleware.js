import { ApiError } from "../utils/ApiError.js";

export const isUserAvailable = (req, _, next) => {
    if (!req?.user) {
      throw new ApiError(401, "Unauthorized; user not available");
    }
    next();
};