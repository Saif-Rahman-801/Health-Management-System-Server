import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  logOutUser,
  loginUser,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logOutUser);

export default router;
