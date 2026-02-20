import { Schema, model } from "mongoose";

const EquipmentSelectionSchema = new Schema(
  {
    id: { type: String, required: true },
    minWeight: { type: Number },
    maxWeight: { type: Number },
  },
  { _id: false }
);

const CustomEquipmentPresetSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    selected: { type: [EquipmentSelectionSchema], default: [] },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fitnessLevel: { type: String, required: true },
    goals: { type: [String], default: [] },
    // Legacy; retained for backwards compatibility (can be removed after migration)
    equipmentAccess: { type: [String], default: [] },
    movementConstraints: { type: [String], default: [] },
    injuryFlags: { type: [String], default: [] },

    equipment: {
      selected: { type: [EquipmentSelectionSchema], default: [] }, // ordered priority list
      customPresets: { type: [CustomEquipmentPresetSchema], default: [] },
    },
  },
  { timestamps: true }
);

export const UserModel = model("User", UserSchema);

const WorkoutSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    generatedSpec: { type: Schema.Types.Mixed, required: true },
    type: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export const WorkoutModel = model("Workout", WorkoutSchema);

const WorkoutCompletionSchema = new Schema(
  {
    workoutId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    rpe: { type: Number, required: true },
    completionTime: { type: Number },
    roundsOrReps: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const WorkoutCompletionModel = model("WorkoutCompletion", WorkoutCompletionSchema);

