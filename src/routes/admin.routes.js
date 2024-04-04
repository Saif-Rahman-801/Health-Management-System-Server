import { Router } from "express";
import {
  isAdmin,
  isUserAvailable,
  verifyJwt,
} from "../middlewares/auth.middleware.js";
import { isAdminTrue } from "../controllers/admin.controllers.js";

const router = Router();

router.route("/admin").get(verifyJwt, isUserAvailable, isAdmin, isAdminTrue);

export default router;
