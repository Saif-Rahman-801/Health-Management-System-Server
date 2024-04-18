import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllUsers, isAdminTrue, searchUser } from "../controllers/admin.controllers.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/admin-info").get(verifyJwt, isUserAvailable, isAdmin, isAdminTrue);

router.route("/users").get(verifyJwt, isUserAvailable, isAdmin, getAllUsers);

router.route("/user").get(verifyJwt, isUserAvailable, isAdmin, searchUser);

export default router;
