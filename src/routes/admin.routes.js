import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { activateAccount, canceledAppointments, confirmDocVerification, deactivateAccount, deleteAllCanceledAppointments, deleteCanceledAppointments, getAUser, getAllUsers, isAdminTrue, searchUser, sortUser, totalPendingAppointments, updateRole, verificationPendingDoctors } from "../controllers/admin.controllers.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/admin-info").get(verifyJwt, isUserAvailable, isAdmin, isAdminTrue);

router.route("/users").get(verifyJwt, isUserAvailable, isAdmin, getAllUsers);

router.route("/search-user").get(verifyJwt, isUserAvailable, isAdmin, searchUser);

router.route("/sort-users").get(verifyJwt, isUserAvailable, isAdmin, sortUser);

router.route("/user").get(verifyJwt, isUserAvailable, isAdmin, getAUser);

router.route("/update-role").put(verifyJwt, isUserAvailable, isAdmin, updateRole);

router.route("/deactivate-account").put(verifyJwt, isUserAvailable, isAdmin, deactivateAccount);

router.route("/activate-account").put(verifyJwt, isUserAvailable, isAdmin, activateAccount);

router.route("/pending-doctors").get(verifyJwt, isUserAvailable, isAdmin, verificationPendingDoctors);

router.route("/verify-doctor").put(verifyJwt, isUserAvailable, isAdmin, confirmDocVerification); 

router.route("/cancled-appoitments").get(verifyJwt, isUserAvailable, isAdmin, canceledAppointments);

router.route("/delete-appoitment").delete(verifyJwt, isUserAvailable, isAdmin, deleteCanceledAppointments);

router.route("/delete-appoitments").delete(verifyJwt, isUserAvailable, isAdmin, deleteAllCanceledAppointments);

router.route("/pending-appoitments").get(verifyJwt, isUserAvailable, isAdmin, totalPendingAppointments);

export default router;
