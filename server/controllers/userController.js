import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User  from "../models/User.js"
import {v2 as cloudinary} from "cloudinary"


//Get user data
// Get user data
export const getUserData = async(req, res) => {
    const userId = req.auth.userId

    try {
        const user = await User.findById(userId)

        if(!user){
            return res.json({success:false, message:'User Not Found'})
        }

        // 👇 THIS LINE WAS MISSING! 👇
        res.json({ success: true, user }) 

    } catch (error) {
        res.json({success:false, message:error.message})
    }
}
// Apply for a job 
export const applyForJob = async (req,res) => {
    const {jobId} = req.body

    const userId =  req.auth.userId

    try {

        const isAlreadyApplied = await JobApplication.find({jobId,userId})

        if(isAlreadyApplied.length > 0){
            return res.json({success:false,message:'Already Applied'})
        }

        const jobData = await Job.findById(jobId)

        if(!jobData) {
            return res.json({success:false,message:'Job Not Found'})
        }

        await JobApplication.create({
            companyId:jobData.companyId,
            userId,
            jobId,
            date:Date.now()
        })

        res.json({success:true,message:'Applied Successfully'})


        
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }


}

// Get user applied application 
export const getUserJobApplications =async (req,res) =>{

    try {

        const userId =req.auth.userId

        const applications = await JobApplication.find({userId})
        .populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()

        if(!applications){
            return res.json({success:false,message:'No job application found for this user.'})
        }

        return res.json({success:true,applications})
        
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }
}

// Update user profile(resume)
// Update user profile (resume)
export const updateUserResume = async (req, res) => {
    try {
        const userId = req.auth.userId
        
        // ❌ OLD: const resumeFile = req.resumeFile 
        // ✅ NEW: Multer usually uses req.file
        const resumeFile = req.file 

        const userData = await User.findById(userId)

        // Debug Log: Check if file is actually received
        console.log("🔴 Uploading Resume for User:", userId)
        console.log("🔴 File received:", resumeFile ? "YES" : "NO")

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
            console.log("🔴 Cloudinary URL:", userData.resume)
        } else {
            // If no file, don't say success!
            return res.json({ success: false, message: 'No file uploaded' })
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {
        console.error("🔴 Upload Error:", error)
        res.json({ success: false, message: error.message })
    }
}