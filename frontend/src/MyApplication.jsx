import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/my-applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load applications");
        }

        setApplications(data);
      })
      .catch((error) => {
        console.error("My Applications:", error);
        alert(error.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>📄 My Applications</h1>

        <button
          style={styles.backButton}
          onClick={() => navigate("/jobs")}
        >
          ← Back to Jobs
        </button>

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div style={styles.empty}>
            <h2>No Applications Yet</h2>
            <p>You have not applied for any jobs yet.</p>
            <button
              style={styles.button}
              onClick={() => navigate("/jobs")}
            >
              Explore Jobs
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {applications.map((application) => (
              <div key={application._id} style={styles.card}>
                <h2 style={styles.title}>
                  {application.jobTitle || "Job"}
                </h2>

                <p>
                  <strong>Company:</strong>{" "}
                  {application.company || "Not specified"}
                </p>

                <p>
                  <strong>Applied on:</strong>{" "}
                  {application.appliedAt
                    ? new Date(application.appliedAt).toLocaleDateString()
                    : "Not available"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span style={styles.status}>
                    {application.status || "Pending"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    color: "#111827",
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "25px",
  },
  backButton: {
    padding: "10px 16px",
    background: "#475569",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    color: "#374151",
  },
  title: {
    color: "#1d4ed8",
    marginBottom: "15px",
  },
  status: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: "bold",
  },
  empty: {
    background: "white",
    padding: "35px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#374151",
  },
  button: {
    padding: "11px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
  },
};

export default MyApplications;