import express from "express";
import { ObjectId } from "mongodb";
import { connection } from "./dbConfig.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ================= VERIFY ADMIN MIDDLEWARE ================= */
const verifyAdmin = (req, res, next) => {
  // ✅ allow preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Admin access only" });

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};


/* ================= SAVE PROPERTY (ADMIN) ================= */
router.post("/api/property", verifyAdmin, async (req, res) => {
  try {
    const db = await connection();

    const propertyData = {
      ...req.body,
      createdAt: Date.now(),
    };

    const result = await db.collection("properties").insertOne(propertyData);

    res.status(201).json({
      success: true,
      message: "Property saved successfully",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save property",
      error: error.message,
    });
  }
});

/* ================= GET ALL PROPERTIES ================= */
router.get("/api/properties", async (req, res) => {
  try {
    const db = await connection();

    const properties = await db
      .collection("properties")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
});

/* ================= GET SINGLE PROPERTY ================= */
router.get("/api/property/:id", async (req, res) => {
  try {
    const db = await connection();

    const property = await db.collection("properties").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({ success: true, data: property });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid property ID",
    });
  }
});

/* ================= UPDATE PROPERTY ================= */
router.put("/api/property/:id", verifyAdmin, async (req, res) => {
  try {
    const db = await connection();

    const result = await db.collection("properties").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    if (!result.matchedCount)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({
      success: true,
      message: "Property updated successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
});

/* ================= DELETE PROPERTY ================= */
router.delete("/api/property/:id", verifyAdmin, async (req, res) => {
  try {
    const db = await connection();

    const result = await db.collection("properties").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
});

/* ================= SAVE BLOG (ADMIN) ================= */
router.post("/api/blog", verifyAdmin, async (req, res) => {
  try {
    const { title, content, image, date, readTime } = req.body;

    if (!title || !content || !image || !date || !readTime)
      return res.status(400).json({
        success: false,
        message: "All blog fields are required",
      });

    const db = await connection();

    const result = await db.collection("blogs").insertOne({
      title,
      content,
      image,
      date,
      readTime,
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Blog saved successfully",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save blog",
      error: error.message,
    });
  }
});

/* ================= GET ALL BLOGS ================= */
router.get("/api/blogs", async (req, res) => {
  try {
    const db = await connection();

    const blogs = await db
      .collection("blogs")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: blogs });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
});

/* ================= GET SINGLE BLOG ================= */
router.get("/api/blog/:id", async (req, res) => {
  try {
    const db = await connection();

    const blog = await db.collection("blogs").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.json({ success: true, data: blog });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }
});

/* ================= LOGIN ================= */
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const db = await connection();
  const user = await db.collection("users").findOne({ email });

  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid email" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res
      .status(401)
      .json({ success: false, message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    role: user.role,
  });
});

export default router;
