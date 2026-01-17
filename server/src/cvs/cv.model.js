import mongoose from "mongoose";

const CVSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    data: {
      // FE tự quyết structure (education, experience, project…)
      type: Object,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CV", CVSchema);
