const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions").default;
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const server = http.createServer(app);

// Language configurations for jdoodle API
const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

// Socket.io connection
io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    // Notify that a new user has joined
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Sync existing code when a new user joins
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle disconnection
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// Compilation endpoint
app.post("/compile", async (req, res) => {
  const { code, language } = req.body;

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: code,
      language: language,
      versionIndex: languageConfig[language].versionIndex,
      clientId: process.env.jDoodle_clientId,
      clientSecret: process.env.kDoodle_clientSecret,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Compilation error:", error);
    res.status(500).json({ error: "Failed to compile code" });
  }
});

// AI suggestions endpoint
// AI suggestions endpoint
app.post("/suggest", async (req, res) => {
  const code = req.body.code;

  console.log("Received code:", code); // Log received code

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    const suggestions = await getSuggestionsFromAI(code);
    console.log("Generated suggestions:", suggestions); // Log generated suggestions
    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    res.status(500).json({ error: error.message || "Failed to fetch AI suggestions" });
  }
});
async function getSuggestionsFromAI(code) {
  try {
    console.log("Sending code to OpenAI:", code); // Log the code being sent
    
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Based on the following code, provide suggestions for improvement or fixes:\n\n${code}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure the correct environment variable is used
        "Content-Type": "application/json",
      },
    });

    // Check if the response contains choices
    if (response.data.choices && response.data.choices.length > 0) {
      const suggestions = response.data.choices[0].message.content.split("\n").filter(Boolean);
      return suggestions; // Return suggestions if available
    } else {
      console.error("No suggestions received from OpenAI.");
      return []; // Return an empty array if no suggestions found
    }
  } catch (error) {
    // Log detailed error information
    console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
    throw new Error("Failed to fetch AI suggestions");
  }
}


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
