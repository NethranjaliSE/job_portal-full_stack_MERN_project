import express from 'express'
import multer from "multer";
import { ChangeJobApplicationsStatus, changeVisibility, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js'
import { protectCompany } from '../middleware/authMiddleware.js';


const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() });


//Register a Company 
router.post('/register',upload.single('image'), registerCompany)

//Company login
router.post('/login', loginCompany)

//Get company data
router.get('/company',protectCompany, getCompanyData)

//Post a job 
router.post('/post-job',protectCompany,postJob)

//Get Applicants Data of Company
router.get('/applicants',protectCompany,getCompanyJobApplicants)

//Get Company Job List 
router.get('/list-jobs',protectCompany,getCompanyPostedJobs)

// Change Application Status
router.post('/change-status',protectCompany,ChangeJobApplicationsStatus)

// Change Application Visibility
router.post('/change-visiblity',protectCompany,changeVisibility)

export default router


