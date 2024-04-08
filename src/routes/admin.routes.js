import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdminTrue } from "../controllers/admin.controllers.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/admin-info").get(verifyJwt, isUserAvailable, isAdmin, isAdminTrue);

export default router;
