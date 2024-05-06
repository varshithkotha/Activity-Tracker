// server.js
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000", //(https://your-client-app.com)
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/activity-tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Define Activity model schema
const activitySchema = new mongoose.Schema({
  activityName: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, default: "in_progress" },
});

const Activity = mongoose.model("Activity", activitySchema);

// Routes
// GET all activities
app.get("/", async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new activity
app.post("/activities", async (req, res) => {
  const { activityName, date } = req.body;

  try {
    const activity = new Activity({
      activityName,
      date,
    });
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT/update an activity status
app.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const activity = await Activity.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE an activity
app.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
