import express from "express";
import serverless from "serverless-http";

import authRoutes from "../backend/routes/auth.js";

const app = express();

// ONLY auth route
app.use("/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

export default serverless(app);