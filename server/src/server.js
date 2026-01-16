import "./config/env.js"; // ← PHẢI ĐỨNG ĐẦU
import connectDB from "./config/db.js";
import app from "./app.js";

connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
