import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import jobRoutes from "./jobs/job.routes.js";
import applicationRoutes from "./applications/application.routes.js";
import testRoutes from "./tests/test.routes.js";
import interviewRoutes from "./interviews/interview.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import offerRoutes from "./offers/offer.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import profileRoutes from "./profiles/profile.routes.js";
import cvRoutes from "./cvs/cv.routes.js";
import path from "path";
import uploadRoutes from "./uploads/upload.routes.js";
import bookmarkRoutes from "./bookmarks/bookmark.routes.js";
import blogRoutes from "./modules/blog/blog.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/cvs", cvRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/blogs", blogRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
