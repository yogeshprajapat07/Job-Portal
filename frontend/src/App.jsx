import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Application from "./Application";

function App() {
   const user = JSON.parse(localStorage.getItem("user") || "null");
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [salaryFilter, setSalaryFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
 


  const [showLogin, setShowLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
const [adminPassword, setAdminPassword] = useState("");




const [newJob, setNewJob] = useState({
  title: "",
  company: "",
  location: "",
  salary: "",
  description: "",
  skills: ""
});

  

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((error) => console.log(error));
  }, []);
useEffect(() => {
  const token = localStorage.getItem("adminToken");

  fetch("http://localhost:5000/api/applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Admin authorization failed");
      }
      return res.json();
    })
    .then((data) => setApplications(data))
    .catch((error) => console.log(error));
}, []);
  const applyJob = (job) => {
  setSelectedJob(job);
};
const handleAddJob = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newJob,
        skills: newJob.skills.split(",").map((skill) => skill.trim()),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Job added successfully!");

      setNewJob({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        skills: "",
      });

      const jobsResponse = await fetch("http://localhost:5000/api/jobs");
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);
    } else {
      alert(data.message || "Failed to add job");
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};
console.log("Job salaries:", jobs.map((job) => job.salary));
const filteredJobs = jobs.filter((job) => {
  const searchText = search.toLowerCase().trim();

  const matchesSearch =
    job.title.toLowerCase().includes(searchText) ||
    job.company.toLowerCase().includes(searchText);

  const matchesLocation = job.location
    .toLowerCase()
    .includes(location.toLowerCase().trim());

  // Convert "5 LPA" into 5
  const salaryValue = parseFloat(
    String(job.salary).replace(/[^0-9.]/g, "")
  );

  // Input value is in LPA
  const minimumSalary = Number(salaryFilter);

  const matchesSalary =
    salaryFilter === "" ||
    (!Number.isNaN(salaryValue) && salaryValue >= minimumSalary);

  return matchesSearch && matchesLocation && matchesSalary;
});

const handleDelete = async (id) => {
  try {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      alert("Please login as admin first");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/applications/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Application deleted successfully!");
      window.location.reload();
    } else {
      alert(data.message || "Delete failed");
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};
const handleAdminLogin = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("adminToken", data.token);

      setIsAdmin(true);
      setShowLogin(false);

      alert("Admin login successful!");
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  formData.append("jobTitle", selectedJob.title);
  formData.append("company", selectedJob.company);

  try {
    const response = await fetch(
      "http://localhost:5000/api/applications",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Application submitted successfully!");
      setSelectedJob(null);
    } else {
      alert(data.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};



  return (
    <div style={styles.page}>
      {user && (
  <div style={{
    textAlign: "right",
    margin: "15px"
  }}>
    <span style={{ color: "#1e293b", fontWeight: "bold" }}>
      Welcome, {user.name}!
    </span>
    
    <button
  onClick={() => window.location.href = "/profile"}
  style={{
    marginLeft: "12px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  My Profile
</button>
<button
  onClick={() => (window.location.href = "/my-applications")}
  style={{
    marginLeft: "10px",
    padding: "10px 16px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  📄 My Applications
</button>

    <button
      onClick={handleLogout}
      style={{
        marginLeft: "12px",
        padding: "10px 16px",
        background: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  </div>
)}
    <button
  onClick={() => {
    window.location.href = "/admin-login";
  }}
  style={styles.adminButton}
>
  🔐 Admin Login
</button>
{isAdmin && (
  <div style={styles.formBox}>
    <h2>Add New Job</h2>

    <form onSubmit={handleAddJob}>
      <input
        type="text"
        placeholder="Job Title"
        value={newJob.title}
        onChange={(e) =>
          setNewJob({ ...newJob, title: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Company"
        value={newJob.company}
        onChange={(e) =>
          setNewJob({ ...newJob, company: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Location"
        value={newJob.location}
        onChange={(e) =>
          setNewJob({ ...newJob, location: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Salary (e.g. 5 LPA)"
        value={newJob.salary}
        onChange={(e) =>
          setNewJob({ ...newJob, salary: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Job Description"
        value={newJob.description}
        onChange={(e) =>
          setNewJob({ ...newJob, description: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Skills (comma separated)"
        value={newJob.skills}
        onChange={(e) =>
          setNewJob({ ...newJob, skills: e.target.value })
        }
        required
      />

      <button type="submit">Add Job</button>
    </form>
  </div>
)}
      {selectedJob && (
  <div style={styles.formBox}>
    <h2
  style={{
    color: "#071B55",
    fontSize: "36px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "25px"
  }}
>
  Apply for {selectedJob.title}
</h2>

    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        name="fullName"
        required
        style={styles.input}
      />

      <input
        type="email"
        placeholder="Email"
        name="email"
        required
        style={styles.input}
      />

      <input
        type="tel"
        placeholder="Phone Number"
        name="phone"
        required
        style={styles.input}
      />

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        name="resume"
        required
        style={styles.input}
      />

      <button type="submit" style={styles.button}>
        Submit Application
      </button>

      <button
        type="button"
        onClick={() => setSelectedJob(null)}
        style={styles.cancelButton}
      >
        Cancel
      </button>
    </form>
  </div>
)}

   < div className="hero-section">
  <h1
  className="hero-title"
  style={{
    display: "block",
    visibility: "visible",
    opacity: 1,
    color: "#1e3a8a",
    fontSize: "46px",
    margin: "0 0 12px"
  }}
>
  💼 Job Portal
</h1>

  <p className="hero-subtitle">
    Find your dream job and build your future
  </p>

  <div className="search-container">
    <input
      type="text"
      placeholder="🔍 Search job or company..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <input
      type="text"
      placeholder="📍 Enter location..."
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />
    <input
  type="number"
  placeholder="💰 Minimum salary (LPA)..."
  value={salaryFilter}
  onChange={(e) => setSalaryFilter(e.target.value)}
/>
<input
  type="text"
  placeholder="💼 Enter job type..."
  value={jobTypeFilter}
  onChange={(e) => setJobTypeFilter(e.target.value)}
/>
  </div>
</div>

      <h2 style={styles.available}>Available Jobs</h2>

      <div style={styles.container}>
        {filteredJobs.map((job) => (
          <div style={styles.card} key={job._id}>
            <h2 style={styles.title}>{job.title}</h2>

            <p>
              <b>Company:</b> {job.company}
            </p>

            <p>
              <b>Location:</b> {job.location}
            </p>

            <p>
              <b>Salary:</b> {job.salary}
            </p>

            <p>
              <b>Description:</b> {job.description}
            </p>

            <p>
              <b>Skills:</b> {job.skills.join(", ")}
            </p>

            <button
  style={styles.button}
  onClick={() => {
    window.location.href = `/apply?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`;
  }}
>
  Apply Now
</button>
          </div>
        ))}
        
      </div>
      <h2 style={styles.available}>Admin - Job Applications</h2>
<div style={styles.container}>
  {applications.map((application) => (
    <div style={styles.card} key={application._id}>
      <h2 style={styles.title}>{application.fullName}</h2>

      <p>
        <b>Job:</b> {application.jobTitle}
      </p>

      <p>
        <b>Company:</b> {application.company}
      </p>

      <p>
        <b>Email:</b> {application.email}
      </p>

      <p>
        <b>Phone:</b> {application.phone}
      </p>

      <p>
        <b>Applied On:</b>{" "}
        {new Date(application.appliedAt).toLocaleString()}
      </p>
      {application.resume && (
  <p>
    <a
      href={`http://localhost:5000/uploads/${application.resume}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      📄 View Resume
    </a>
  </p>
)}
      <button
  style={styles.deleteButton}
  onClick={() => handleDelete(application._id)}
>
  Delete
</button>
    </div>
  ))}
</div>
    </div>
  );
}

const styles = {
  
  page: {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "1600px",
  margin: "0 auto",
  backgroundColor: "#f4f6f8",
  padding: "30px 24px",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
},

  heading: {
    textAlign: "center",
    color: "#1e293b",
    marginBottom: "5px",
  },
  formBox: {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "500px",
  margin: "20px auto",
  boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
},
adminButton: {
  position: "fixed",
  top: "20px",
  left: "24px",
  padding: "10px 18px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  zIndex: 1000,
},



  subtitle: {
    textAlign: "center",
    color: "#64748b",
  },

  available: {
    textAlign: "center",
    color: "#334155",
    marginTop: "35px",
  },

  container: {
  width: "100%",
  maxWidth: "1200px",
  margin: "30px auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
  gap: "24px",
  boxSizing: "border-box",
},

  card: {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  transition: "box-shadow 0.2s ease",
},

  title: {
    color: "#2563eb",
    marginBottom: "15px",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
};

export default App;