import { useState } from "react";
import { useSearchParams } from "react-router-dom";
function Application() {
    const [searchParams] = useSearchParams();

const jobTitle = searchParams.get("title") || "Job";
const company = searchParams.get("company") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first!");
    window.location.href = "/";
    return;
  }

  const data = new FormData();

  data.append("fullName", formData.fullName);
  data.append("email", formData.email);
  data.append("phone", formData.phone);
  data.append("jobTitle", jobTitle);
  data.append("company", company);

  if (formData.resume) {
    data.append("resume", formData.resume);
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/applications",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("Application submitted successfully!");
      window.location.href = "/jobs";
    } else {
      alert(result.message || "Application failed");
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};

  return (
    <div className="application-page">
      <div className="application-box">
        <h1>Apply for {jobTitle}</h1>
<p>Company: {company}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            required
          />

          <button type="submit">
            Submit Application
          </button>
        </form>

        <button
          className="back-button"
          onClick={() => (window.location.href = "/")}
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );
}

export default Application;