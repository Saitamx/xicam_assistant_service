const { openAi } = require("./utils/instances");
const bodyParser = require("body-parser");
const functions = require("./functions");
const socketIo = require("socket.io");
const express = require("express");
const http = require("http");
require("dotenv").config();

// Creación del servidor Express y configuración de Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
console.log("Express y Socket.io configurados");

// Variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let threadId = process.env.THREAD_ID;
let assistantId = process.env.ASSISTANT_ID;
console.log("Variables de entorno cargadas", OPENAI_API_KEY);

// Configuración de middlewares
app.use(bodyParser.json());
app.use(express.static("public"));
console.log("Middlewares configurados");

// Gestión de conexiones Socket.io
io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado a Socket.io");

  socket.on("message", async ({ message }) => {
    console.log("Mensaje recibido del cliente:", message);
    try {
      // Enviar mensaje al LLM y obtener respuesta
      const response = await openAi.post("http://localhost:3000/newMessage", {
        thread_id: threadId,
        message,
      });
      console.log("Respuesta recibida del LLM");

      // Emitir la respuesta del LLM al cliente
      const llmResponse = response.data.messages.data[0].content[0].text.value;
      io.emit("message", {
        user: "LLM",
        message: llmResponse,
        categoryCode: response.data.categoryCode,
      });
      console.log("Respuesta del LLM enviada al cliente");
    } catch (error) {
      console.error("Error comunicándose con LLM:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado de Socket.io");
  });
});

// Endpoint para crear un nuevo asistente
app.post("/newAssistant", async (req, res) => {
  console.log("Solicitud recibida para crear un nuevo hilo");
  const { user, password } = req.body;

  let threadId;
  let assistantId;

  if (!user || !password) {
    console.log("Error: Faltan campos requeridos en /newAssistant");
    return res.status(400).json({ error: "Faltan campos requeridos." });
  }

  if (user !== process.env.USER || password !== process.env.PASSWORD) {
    console.log("Error: Autenticación fallida en /newAssistant");
    return res.status(403).json({ error: "Autenticación fallida." });
  }

  try {
    const resThreads = await openAi.post("https://api.openai.com/v1/threads", {
      messages: [],
    });

    threadId = resThreads.data.id;
    console.log(`New thread created with ID: ${resThreads.data.id}`);

    assistantId = await functions.handleCreateAssistant(threadId);
    console.log(`Nuevo asistente creado`, {
      assistantId,
      threadId,
    });

    res.json({ assistantId, threadId });
  } catch (error) {
    console.error("Error creando asistente:", error);
    res.status(500).send("Error creando asistente");
  }
});

// Endpoint para enviar un nuevo mensaje
app.post("/newMessage", async (req, res) => {
  console.log("Solicitud recibida para enviar un nuevo mensaje");
  const { message, thread_id } = req.body;

  try {
    const categoryCode = await functions.handleClassifyQuestion(message);
    console.log(
      "Mensaje clasificado con el código de categoría:",
      categoryCode
    );

    const response = await openAi.post(
      `https://api.openai.com/v1/threads/${thread_id}/runs`,
      { assistant_id: assistantId }
    );
    console.log(`Ejecución iniciada con ID: ${response.data.id}`);

    const messages = await functions.handleResponseInBackground(
      thread_id,
      response.data.id
    );
    console.log("Respuesta procesada en segundo plano");
    res.status(200);
  } catch (error) {
    console.error("Error en el chat:", error.response);
    res.status(500).send("Error en el chat");
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Servidor ejecutándose en el puerto ${PORT}`)
);