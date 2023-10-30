// Import required modules
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create an Express application
const app = express();

// Create an HTTP server using Express
const server = http.createServer(app);

// Initialize Socket.IO
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Model: Task management
const tasks = [];

// View: Socket.IO for real-time updates
io.on("connection", (socket) => {
  // Emit existing tasks to connected clients
  socket.emit("tasks", tasks);

  // Handle client requests to add a task
  socket.on("addTask", (task) => {
    tasks.push(task);
    io.emit("tasks", tasks); // Notify all clients about the update
  });

  // Handle client requests to delete a task
  socket.on("deleteTask", (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      io.emit("tasks", tasks); // Notify all clients about the update
    }
  });
});

// Controller: Define API endpoints
app.use(cors());
app.use(bodyParser.json());

// Get all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// Create a new task
app.post("/api/tasks", (req, res) => {
  const newTask = req.body;
  tasks.push(newTask);
  io.emit("tasks", tasks); // Notify all clients about the update
  res.json(newTask);
});

// Delete a task by ID
app.delete("/api/tasks/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  console.log("taskId", taskId);

  // Find the task with the specified ID and remove it from the tasks array
  const taskIndex = tasks.findIndex((task) => task.id === parseInt(taskId));

  if (taskIndex === -1) {
    // Task not found, return an error response
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);

  // Send a success response
  res.json({ message: "Task deleted successfully" });

  // Notify clients of the change using Socket.IO
  io.emit("tasks", tasks);
});

// Start the server
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
