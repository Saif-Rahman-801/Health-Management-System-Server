import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isDoctor } from "../middlewares/isDoctor.middleware.js";
import { acceptAppointment, cancelAppointment, getYourCanceledAppointments, isDoctorTrue, requestedAppointments, undoAppointmentCanceletion, verifyAsDoctor } from "../controllers/doctor.controllers.js";

const router = Router();

router.route("/doctor-info").get(verifyJwt, isUserAvailable, isDoctor, isDoctorTrue);

router.route("/verifyAs-doctor").post(verifyJwt, isUserAvailable, isDoctor, verifyAsDoctor);

router.route("/appointment-requests").get(verifyJwt, isUserAvailable, isDoctor, requestedAppointments);

router.route("/accept-appointment").put(verifyJwt, isUserAvailable, isDoctor, acceptAppointment); 

router.route("/cancel-appointment").put(verifyJwt, isUserAvailable, isDoctor, cancelAppointment);

router.route("/doc-canceled-appointment").get(verifyJwt, isUserAvailable, isDoctor, getYourCanceledAppointments);

router.route("/undo-canceletion").put(verifyJwt, isUserAvailable, isDoctor, undoAppointmentCanceletion);

export default router;
