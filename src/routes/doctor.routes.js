import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isDoctor } from "../middlewares/isDoctor.middleware.js";
import { isDoctorTrue, verifyAsDoctor } from "../controllers/doctor.controllers.js";

const router = Router();

router.route("/doctor-info").get(verifyJwt, isUserAvailable, isDoctor, isDoctorTrue);

router.route("/verifyAs-doctor").post(verifyJwt, isUserAvailable, isDoctor, verifyAsDoctor);


export default router;
