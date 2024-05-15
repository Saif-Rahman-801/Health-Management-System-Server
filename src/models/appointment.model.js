import mongoose, { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    doctorAppointmentEmail: {
      type: String,
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    appoitmentDone: {
      type: Boolean,
      default: false,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    canceled: {
      type: Boolean,
      default: false,
      required: true,
    }
  },
  { timestamps: true }
);

export const Appointment = model("Appointment", appointmentSchema);
