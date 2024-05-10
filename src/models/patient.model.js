import mongoose, { Schema, model } from "mongoose";

const appointmentSchema = new Schema({
  doctorName: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
});

const prescriptionSchema = new Schema({
  medicine: {
    type: String,
    required: true,
  },
  dosage: String,
  instructions: String,
});

const patientSchema = new Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    // Appointments
    upcomingAppointments: [appointmentSchema],
    recentAppointments: [appointmentSchema],
    // Prescriptions
    prescriptions: [prescriptionSchema],
  },
  {
    timestamps: true,
  }
);

export const Patient = model("Patient", patientSchema);
