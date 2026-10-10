const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");

const path = require("path");

const cors = require("cors");

require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./model/job");
const Application = require("./model/application");
const Admin = require("./model/admin");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Verify User Token
function verifyUserToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jobportal_secret"
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again."
    });
  }
}
// Verify Admin
async function verifyAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.username) {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin || admin.username !== req.user.username) {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Admin verification failed"
    });
  }
}

const multer = require("multer");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));
const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(cors());
app.use(express.json());
// User Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered. Please login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Signup successful! Please login."
    });

  } catch (error) {
    console.error("User signup error:", error);

    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
});
// User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET || "jobportal_secret",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("User login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});
// Admin Signup
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const admin = new Admin({
  username,
  password: hashedPassword
});

    await admin.save();

    res.status(201).json({
      message: "Admin signup successful"
    });

  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
});
// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username
      },
      process.env.JWT_SECRET || "jobportal_secret",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Admin login successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// Create Job - Admin Only
app.post("/api/jobs", verifyUserToken, verifyAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    const savedJob = await job.save();

    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({
      message: "Error creating job",
      error: error.message
    });
  }
});
// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching jobs",
      error: error.message
    });
  }
});
app.post(
  "/api/applications",
  verifyUserToken,
  upload.single("resume"),
  async (req, res) => {
  try {
  const applicationData = {
  ...req.body,
  userId: req.user.id,
  resume: req.file ? req.file.filename : ""
};

const application = new Application(applicationData);

const savedApplication = await application.save();

    console.log("Application saved:", savedApplication);

    res.status(201).json({
      message: "Application submitted successfully",
      application: savedApplication
    });
  } catch (error) {
    console.error("Application save error:", error);

    res.status(500).json({
      message: "Error submitting application",
      error: error.message
    });
  }
});
app.get(
  "/api/applications",
  verifyUserToken,
  verifyAdmin,
  async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching applications",
      error: error.message
    });
  }
});
app.get("/api/my-applications", verifyUserToken, async (req, res) => {
  try {
    const applications = await Application.find({
  userId: req.user.id,
}).sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("My Applications error:", error);

    res.status(500).json({
      message: "Failed to fetch your applications",
    });
  }
});
// Delete Application
app.delete(
  "/api/applications/:id",
  verifyUserToken,
  verifyAdmin,
  async (req, res) => {
  try {
    const deletedApplication = await Application.findByIdAndDelete(req.params.id);

    if (!deletedApplication) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json({
      message: "Application deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      
      message: "Error deleting application",
      error: error.message
    });
  }
});
// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "Job Portal API is running"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});