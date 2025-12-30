import "./config/instrument.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from "./controllers/webhooks.js";
import companyRoutes from "./routes/companyRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { clerkMiddleware } from "@clerk/express";

// Initialize Express
const app = express();

// Connect to database
await connectDB();
await connectCloudinary();

// Middlewares
app.use(cors()); // Simplified CORS for now (add your domains back if needed)

// ⚠️ CRITICAL CHANGE HERE ⚠️
// 1. This route MUST be defined BEFORE app.use(express.json())
// 2. We use express.raw() so Svix can verify the signature
app.post("/webhooks", express.raw({ type: "application/json" }), clerkWebhooks);

// 3. NOW we can use the JSON parser for the rest of the app
app.use(express.json());

// 4. Clerk Middleware for auth routes
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// app.post('/webhooks', clerkWebhooks) // ❌ REMOVED from here (moved up)

app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);

// Port
const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
