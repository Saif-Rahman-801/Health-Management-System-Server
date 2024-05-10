import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import patientRouter from "./routes/patient.routes.js";

// routes declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v2/admin-dasboard", adminRouter);
app.use("/api/v3/doctors-dasboard", doctorRouter);
app.use("/api/v4/patients-dasboard", patientRouter);

export { app };