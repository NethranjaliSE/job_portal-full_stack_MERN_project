import React, { useContext } from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import ApplyJob from "./pages/ApplyJob"
import Application from "./pages/Application"
import RecruiterLogin from "./components/RecruiterLogin"
import { AppContext } from "./context/AppContext"
import Dashboard from "./pages/Dashboard"
import AddJob from "./pages/AddJob"
import Managejobs from "./pages/Managejobs"
import ViewApplications from "./pages/ViewApplications"
import "quill/dist/quill.snow.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const App = () => {
  const { showRecruiterLogin } = useContext(AppContext)

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Application />} />

        {/* Dashboard Route - Parent */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Dashboard Child Routes */}
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-jobs" element={<Managejobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
