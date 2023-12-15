const socket = io();
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

// Función para agregar mensajes al chat
function appendMessage(user, message, categoryCode) {
  console.log("Añadiendo mensaje al chat...")
  console.log("Usuario:", user);
  console.log("Mensaje:", message);
  console.log("Código de categoría:", categoryCode);

  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.textContent = `${user.toUpperCase()}: ${message}`;


  // logica para manejar los componentes de la interfaz
  if (categoryCode === "0" || !categoryCode) {
    console.log("Añadiendo mensaje al chat...");
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    console.log("Código de categoría diferente de 0:", categoryCode);
    const categorySection = document.getElementById(categoryCode);
    if (categorySection) {
      console.log("Agregando mensaje a la sección correspondiente...");
      categorySection.appendChild(messageDiv);
      categorySection.scrollTop = categorySection.scrollHeight;
    } else {
      console.log("Error: No se encontró la sección correspondiente para el código de categoría:", categoryCode);
    }
  }
}

// Escuchar mensajes del servidor
socket.on("message", (data) => {
  console.log("Recibiendo mensaje del servidor...")
  console.log("Datos:", data);
  appendMessage(data.user, data.message, data.categoryCode);
  sendButton.disabled = false;
  messageInput.disabled = false;
  sendButton.textContent = "Enviar";
  messageInput.value = "";
});

// Enviar mensajes al servidor
function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== "") {
    // Deshabilitar el botón y campo de entrada
    sendButton.disabled = true;
    messageInput.disabled = true;
    sendButton.textContent = "Enviando...";

    console.log("Enviando mensaje al servidor...");
    appendMessage("Usuario", message); // No se proporciona categoryCode aquí, ya que es responsabilidad del servidor determinarlo
    socket.emit("message", { message: message }); // Solo se envía 'message'

    // Aquí no es necesario agregar la lógica para esperar el evento "message-sent"
  }
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    sendMessage();
    event.preventDefault();
  }
});
