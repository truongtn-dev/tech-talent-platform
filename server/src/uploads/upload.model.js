import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Upload", UploadSchema);
