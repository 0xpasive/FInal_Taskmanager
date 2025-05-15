const mongoose = require("mongoose");

const User = require("./User");

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isVerified: { type: Boolean, default: false }
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});



const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
