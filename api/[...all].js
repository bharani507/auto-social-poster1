import express from "express";
import serverless from "serverless-http";
import authRoutes from "../backend/routes/auth.js";
import postRoutes from "../backend/routes/post.js";  // ADD THIS

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/post", postRoutes);  // ADD THIS

app.get("/", (req, res) => res.send("API WORKING"));

export default serverless(app);