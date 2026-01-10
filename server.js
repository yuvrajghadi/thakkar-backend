import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import propertyRoutes from "./property.routes.js";

dotenv.config();

const app = express();

/* ======================================================
   ✅ CORS CONFIG (ADD THIS HERE – TOP, BEFORE ROUTES)
====================================================== */
const allowedOrigins = [
  "https://thakkarrealtors.com",
  "https://www.thakkarrealtors.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server requests (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* 🔥 REQUIRED FOR PREFLIGHT */
app.options("*", cors());

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(express.json());

/* ======================================================
   ROUTES
====================================================== */
app.use("/", propertyRoutes);

/* ======================================================
   SERVER (ONLY if NOT using Vercel serverless)
====================================================== */
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
