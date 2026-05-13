import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

// 🔥 CONNECT DATABASE FIRST
await connectDB();

app.use(cors());

app.use(express.json());

// 🔥 ROUTES
app.use("/auth", authRoutes);

app.use("/post", postRoutes);

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

export default app;
