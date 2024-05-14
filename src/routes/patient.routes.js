import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isPatient } from "../middlewares/isPatient.middleware.js";
import { getAllDoctors, isPatientTrue, requestAppointment, searchDoctors, sortDoctorByExperienceAndDegrees } from "../controllers/patient.controllers.js";

const router = Router();

router.route("/patient-info").get(verifyJwt, isUserAvailable, isPatient, isPatientTrue);

router.route("/search-doctors").get(verifyJwt, isUserAvailable, isPatient, searchDoctors);

router.route("/getAllDoctors").get(verifyJwt, isUserAvailable, isPatient, getAllDoctors);

router.route("/sort-doctors").get(verifyJwt, isUserAvailable, isPatient, sortDoctorByExperienceAndDegrees);

router.route("/request-appointment").post(verifyJwt, isUserAvailable, isPatient, requestAppointment);

export default router;