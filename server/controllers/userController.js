import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { Clerk } from "@clerk/clerk-sdk-node";

// Initialize Clerk Client (Needed to fetch user details if missing in DB)
const clerkClient = new Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// 1. Get User Data (With Auto-Sync Fallback)
export const getUserData = async (req, res) => {
  const userId = req.auth.userId;

  try {
    let user = await User.findById(userId);

    // 🔴 FIX: If user is not in MongoDB, fetch from Clerk and create them immediately.
    // This prevents the "User Not Found" error on the dashboard.
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        _id: userId, // Set _id to Clerk ID
        name: clerkUser.firstName + " " + clerkUser.lastName,
        email: clerkUser.emailAddresses[0].emailAddress,
        image: clerkUser.imageUrl,
        resume: "",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.json({ success: false, message: error.message });
  }
};

// 2. Apply for a Job
export const applyForJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.auth.userId;

  try {
    // Check if already applied
    const isAlreadyApplied = await JobApplication.find({ jobId, userId });

    if (isAlreadyApplied.length > 0) {
      return res.json({ success: false, message: "Already Applied" });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.json({ success: false, message: "Job Not Found" });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId: userId, // Saves the Clerk ID (String)
      jobId: jobId,
      date: Date.now(),
    });

    res.json({ success: true, message: "Applied Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 3. Get User's Applied Jobs
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();

    if (!applications) {
      return res.json({
        success: false,
        message: "No job application found for this user.",
      });
    }

    return res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 4. Update User Resume
export const updateUserResume = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const resumeFile = req.file;

    const userData = await User.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
        resource_type: "raw", // "raw" handles non-image files like PDFs
      });
      userData.resume = resumeUpload.secure_url;
      await userData.save();
      return res.json({ success: true, message: "Resume Updated" });
    } else {
      return res.json({ success: false, message: "No file uploaded" });
    }
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.json({ success: false, message: error.message });
  }
};
