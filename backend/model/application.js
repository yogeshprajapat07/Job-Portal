const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  userId: {
  type: String,
  default: ""
},
  phone: {
    type: String,
    required: true
  },
  resume: {
  type: String,
  required: false
},
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
  type: String,
  enum: ["Pending", "Shortlisted", "Rejected", "Selected"],
  default: "Pending"
}
});

module.exports = mongoose.model("Application", applicationSchema);