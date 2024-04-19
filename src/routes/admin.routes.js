import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAUser, getAllUsers, isAdminTrue, searchUser, sortUser } from "../controllers/admin.controllers.js";
import { isUserAvailable } from "../middlewares/isUserAvailable.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/admin-info").get(verifyJwt, isUserAvailable, isAdmin, isAdminTrue);

router.route("/users").get(verifyJwt, isUserAvailable, isAdmin, getAllUsers);

router.route("/search-user").get(verifyJwt, isUserAvailable, isAdmin, searchUser);

router.route("/sort-users").get(verifyJwt, isUserAvailable, isAdmin, sortUser);

router.route("/user").get(verifyJwt, isUserAvailable, isAdmin, getAUser);


export default router;
