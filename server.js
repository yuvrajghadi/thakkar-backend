import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import propertyRoutes from "./property.routes.js";

dotenv.config(); // ✅ LOAD ENV VARIABLES

const app = express();

app.use(
  cors({
    origin: "https://thakkhar-froentend.vercel.app", // frontend URL
    credentials: true,
  })
);

app.use(express.json());

// ROUTES
app.use("/", propertyRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
