import mongoose, { Schema } from "mongoose";
import { model } from "mongoose";

const appointmentSchema = new Schema({
  clientName: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
});

const doctorSchema = new Schema(
  {
    // Basic Information
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
    appointmentEmail: {
      type: String,
      required: true,
    },
    // Custom Doctor Fields
    degrees: {
      type: [String],
      required: true,
    }, // Array of degrees
    collegeName: {
      type: String,
      required: true,
    },
    bloodGroup: String,
    experience: Number, // Years of experience
    completedAppointments: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // Additional fields
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    // Upcoming Appointments
    upcomingAppointments: [appointmentSchema],
  },
  {
    timestamps: true,
  }
);

export const Doctor = model("Doctor", doctorSchema);