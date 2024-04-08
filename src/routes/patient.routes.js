import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isPatient } from "../middlewares/isPatient.middleware.js";

const router = Router();

router.route("/patient").get(verifyJwt, isUserAvailable, isPatient, isPatientTrue);

export default router;