import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isPatient } from "../middlewares/isPatient.middleware.js";
import { isPatientTrue, searchDoctors } from "../controllers/patient.controllers.js";

const router = Router();

router.route("/patient-info").get(verifyJwt, isUserAvailable, isPatient, isPatientTrue);
router.route("/search-doctors").get(verifyJwt, isUserAvailable, isPatient, searchDoctors);

export default router;