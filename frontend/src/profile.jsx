import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>👤 My Profile</h1>

        <div style={styles.avatar}>
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <h2>{user.name}</h2>
        <p><strong>Email:</strong> {user.email}</p>

        <button
          style={styles.button}
          onClick={() => navigate("/jobs")}
        >
          Back to Jobs
        </button>

        <button
          style={styles.logout}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eff6ff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    background: "white",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(12, 12, 12, 0.1)",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    fontSize: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px auto",
  },
  button: {
    padding: "12px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    margin: "10px",
    cursor: "pointer",
  },
  logout: {
    padding: "12px 18px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    margin: "10px",
    cursor: "pointer",
  },
};

export default Profile;