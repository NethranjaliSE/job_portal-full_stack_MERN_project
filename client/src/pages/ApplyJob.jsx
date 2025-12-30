import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import kconvert from "k-convert";
import moment from "moment";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";

const ApplyJob = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  const {
    jobs,
    backendUrl,
    userData,
    setUserData,
    userApplications,
    fetchUserApplications,
  } = useContext(AppContext);

  // ---------------- FETCH JOB ----------------
  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`);
      if (data.success) {
        setJobData(data.job);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ---------------- DEBUG APPLY HANDLER ----------------
  const applyHandler = async () => {
    console.log("🔴 1. Button Clicked. Starting handler...");

    try {
      // 1. Check Backend URL
      console.log("🔴 2. Backend URL:", backendUrl);
      if (!backendUrl) {
        return toast.error("Error: Backend URL is missing");
      }

      // 2. Check Token
      const token = await getToken();
      console.log("🔴 3. Token received:", token ? "Yes" : "No");

      if (!token) {
        return toast.error("Login to apply for jobs");
      }

      // 3. Check User Data
      let currentUserData = userData;
      console.log("🔴 4. Initial User Data:", currentUserData);

      if (!currentUserData) {
        console.log("🔴 5. User Data missing, fetching from API...");
        try {
          const { data } = await axios.get(backendUrl + "/api/users/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("🔴 6. Fetch Result:", data);

          if (data.success) {
            currentUserData = data.user;
            setUserData(data.user);
          } else {
            return toast.error("Failed to load user profile");
          }
        } catch (err) {
          console.error("🔴 Fetch Error:", err);
          return toast.error("Network error loading profile");
        }
      }

      // 4. Resume Check
      console.log("🔴 7. Checking Resume on:", currentUserData);

      if (!currentUserData || !currentUserData.resume) {
        console.log("🔴 8. No Resume found. Redirecting.");
        navigate("/applications");
        return toast.error("Upload resume to apply");
      }

      // 5. Sending Application
      console.log("🔴 9. Sending Application for Job ID:", jobData._id);

      const { data } = await axios.post(
        backendUrl + "/api/users/apply",
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🔴 10. API Response:", data);

      if (data.success) {
        toast.success(data.message);
        setIsAlreadyApplied(true);
        if (fetchUserApplications) fetchUserApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("🔴 CRITICAL ERROR:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // ---------------- CHECK ALREADY APPLIED ----------------
  const checkAlreadyApplied = () => {
    if (!userApplications) return;
    const hasApplied = userApplications.some(
      (item) => item.jobId === jobData._id || item.jobId?._id === jobData._id
    );
    setIsAlreadyApplied(hasApplied);
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  useEffect(() => {
    if (jobData && userApplications && userApplications.length > 0) {
      checkAlreadyApplied();
    }
  }, [jobData, userApplications]);

  // ---------------- UI ----------------
  return jobData ? (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          {/* HEADER */}
          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center">
              <img
                className="h-24 bg-white rounded-lg p-4 mr-4 border"
                src={jobData.companyId?.image}
                alt=""
              />
              <div className="text-center md:text-left text-neutral-700">
                <h1 className="text-2xl sm:text-4xl font-medium">
                  {jobData.title}
                </h1>
                <div className="flex flex-wrap gap-6 mt-2 text-gray-600 justify-center md:justify-start">
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            {/* APPLY BUTTON */}
            <div className="flex flex-col justify-center text-center">
              <button
                onClick={applyHandler}
                disabled={isAlreadyApplied}
                className={`p-2.5 px-10 text-white rounded mt-10 ${
                  isAlreadyApplied
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600"
                }`}
              >
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
              <p className="mt-1 text-gray-600">
                Posted {moment(jobData.date).fromNow()}
              </p>
            </div>
          </div>

          {/* JOB DESCRIPTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-2xl mb-4">Job description</h2>
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: jobData.description }}
              />
              <button
                onClick={applyHandler}
                disabled={isAlreadyApplied}
                className={`p-2.5 px-10 text-white rounded mt-6 ${
                  isAlreadyApplied
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600"
                }`}
              >
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
            </div>
            {/* MORE JOBS */}
            <div className="w-full lg:w-1/3 mt-8 lg:ml-8 space-y-5">
              <h2>More jobs from {jobData.companyId.name}</h2>
              {jobs
                .filter(
                  (job) =>
                    job._id !== jobData._id &&
                    job.companyId &&
                    job.companyId._id === jobData.companyId._id
                )
                .slice(0, 4)
                .map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};
export default ApplyJob;
