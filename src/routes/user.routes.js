import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  changeCurrentPassWord,
  forgotPassword,
  getCurrentUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJwt, logOutUser);
router.route("/change-password").post(verifyJwt, changeCurrentPassWord);
router.route("/get-user").get(verifyJwt, getCurrentUser);
router.route("/forget-password").post(forgotPassword);
router.route("/resetPass/:token").put(resetPassword);

export default router;
