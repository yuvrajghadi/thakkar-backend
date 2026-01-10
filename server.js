import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import propertyRoutes from "./property.routes.js";

dotenv.config();

const app = express();

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: "https://thakkarrealtors.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* 🔥 THIS IS THE KEY LINE */
app.options("*", cors());

app.use(express.json());

/* ===================== ROUTES ===================== */
app.use("/", propertyRoutes);

/* ===================== SERVER ===================== */
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
