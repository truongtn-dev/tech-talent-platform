import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String, // Markdown or HTML
            required: true,
        },
        thumbnail: {
            type: String,
            default: "",
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED"],
            default: "DRAFT",
        },
        tags: [{
            type: String,
            trim: true
        }]
    },
    {
        timestamps: true,
    }
);

BlogSchema.index({ title: "text", content: "text" });

export default mongoose.model("Blog", BlogSchema);
