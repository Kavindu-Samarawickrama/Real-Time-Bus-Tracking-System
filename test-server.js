const express = require("express");
const app = express();

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic JSON middleware
app.use(express.json());

// Test routes
app.get("/", (req, res) => {
  res.json({
    message: "Test server is working!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Health check passed",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const PORT = 3005;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Test server running on http://127.0.0.1:${PORT}`);
  console.log(`Test it with: curl http://127.0.0.1:${PORT}/api/health`);
});
