import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

// 🔥 ROUTES
app.use("/auth", authRoutes);

// 🔥 TEST ROUTE
app.get("/", (req, res) => {

  const success = req.query.success;

  if (success === "true") {

    return res.send(`
      <h1 style="color:green;">
        Login Successfully ✅
      </h1>
    `);
  }

  res.send(`
    <h1>
      Backend Running
    </h1>
  `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
