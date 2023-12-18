const { openAi } = require("./utils/instances");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const handleCreateAssistant = async (threadId) => {
  const assistantFilePath = path.join(__dirname, "assistant.json");

  if (fs.existsSync(assistantFilePath)) {
    const assistantData = JSON.parse(
      fs.readFileSync(assistantFilePath, "utf8")
    );
    console.log("Loaded existing assistant ID.");
    return assistantData.assistant_id;
  } else {
    const fileFormData = new FormData();
    fileFormData.append("file", fs.createReadStream("knowledge.docx"));
    fileFormData.append("purpose", "assistants");

    const fileResponse = await openAi.post(
      "https://api.openai.com/v1/files",
      fileFormData,
      {
        headers: {
          ...fileFormData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const assistantResponse = await openAi.post(
      "https://api.openai.com/v1/assistants",
      {
        instructions: `
        Eres un asistente de Xicam especializado en atención al cliente y ventas. 
        Tu función es proporcionar información clara y concisa sobre Xicam, enfocándote en sus productos, servicios y consultas relacionadas. Debes hablar en español chileno y limitarte a responder únicamente sobre temas relacionados con Xicam. 
        Al responder preguntas, tu enfoque debe ser directo, conciso y al grano. Evita incluir información irrelevante o extenderte en detalles que no sean necesarios para responder directamente a la consulta realizada. 
        No agregues referencias externas o citas en tus respuestas. Siempre mantén una actitud servicial y profesional.
        Utiliza el documento adjunto sobre Xicam para responder preguntas específicas sobre dirección, horarios de atención, precios, productos, atención al cliente, pre-reserva y stock de productos. 
        Evita dar respuestas vagas o genéricas; en su lugar, ofrece información precisa y relevante basada en el contenido del documento proporcionado.`,
        model: "gpt-3.5-turbo-1106",
        tools: [{ type: "retrieval" }],
        file_ids: [fileResponse.data.id],
      }
    );

    const assistantId = assistantResponse.data.id;

    fs.writeFileSync(
      assistantFilePath,
      JSON.stringify({ assistantId, threadId }, null, 2)
    );
    console.log("Created a new assistant and saved the ID.");
    return assistantId;
  }
};

const handleClassifyQuestion = async (question) => {
  const response = await openAi.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `
          Eres un asistente avanzado diseñado para clasificar preguntas de clientes en categorías específicas. 
          Tu habilidad principal es identificar y clasificar preguntas, independientemente de si vienen en un solo mensaje o en múltiples mensajes. 
          Puedes manejar una variedad de formatos de preguntas, incluyendo preguntas simples, múltiples preguntas en un mensaje, y preguntas distribuidas en varios mensajes. 
          Cada pregunta debe ser clasificada en una de las siguientes categorías:
      
          1. 'Dirección y Contacto'
          2. 'Horario de Atención'
          3. 'Precios y Productos'
          4. 'Atención al Cliente'
          5. 'Pre-Reserva de Productos'
          6. 'Stock de Productos'
          0. 'Otra'

          Ejemplo categoria 1: 
          "¿Dónde está ubicado Xicam?"
          "¿Cuál es la dirección de Xicam?"
          "¿Cuál es el teléfono de Xicam?"
          "¿Cuál es el correo de Xicam?"

          Ejemplo categoria 2:
          "¿A qué hora abre Xicam?"
          "¿A qué hora cierra Xicam?"
          "¿Cuál es el horario de atención de Xicam?"

          Ejemplo categoria 3:
          "¿Cuánto cuesta un uniforme de Xicam?"
          "¿Cuánto cuesta un buzo de Xicam?"
          "¿Cuánto cuesta un pantalón de Xicam?"

          Ejemplo categoria 4:
          "¿Cómo puedo contactar a Xicam?"
          "¿Cómo puedo hablar con un ejecutivo de Xicam?"
          "¿Cómo puedo hablar con un vendedor de Xicam?"

          Ejemplo categoria 5:
          "¿Cómo reservo un producto?"
          "¿Cómo puedo reservar un producto?"
          "¿Cómo puedo prereservar un producto?"

          Ejemplo categoria 6:
          "¿Hay stock disponible para los buzos de Xicam?"
          "¿Hay stock disponible para los pantalones de Xicam?"
          "¿Hay stock disponible para los uniformes de Xicam?"

          Ejemplo categoria 0:
          "¿Cuál es la capital de Chile?"
          "¿Cuál es el nombre del presidente de Chile?"
          "¿Cuál es el animal más grande del mundo?"
          "¿Cuál es el animal más pequeño del mundo?"

          Por ejemplo:
          - "¿Dónde está ubicado Xicam?" debe clasificarse en la categoría 1.
          - "¿A qué hora abre Xicam?" debe clasificarse en la categoría 2.
          - "¿Cuánto cuesta un uniforme de Xicam?" debe clasificarse en la categoría 3.
          - "¿Cómo puedo contactar a Xicam?" debe clasificarse en la categoría 4.
          - "¿Cómo reservo un producto?" debe clasificarse en la categoría 5.
          - "¿Hay stock disponible para los buzos de Xicam?" debe clasificarse en la categoría 6.
          - "¿Cuál es la capital de Chile?" debe clasificarse en la categoría 0.
          - "¿Cuál es el nombre del presidente de Chile?" debe clasificarse en la categoría 0.

          Tu respuesta debe incluir la clasificación de cada pregunta, asegurándote de abordar todas las preguntas presentadas en un mensaje, así como las preguntas que se extienden en múltiples mensajes. 
          Es crucial que mantengas un seguimiento coherente y preciso de las preguntas y sus clasificaciones correspondientes.
    
          Nota: Este prompt es capaz de manejar múltiples preguntas en paralelo. 
          Por ejemplo, si un usuario envía tres preguntas distintas en un solo mensaje, debes ser capaz de clasificar cada una en su categoría respectiva simultáneamente. 
          Del mismo modo, si las preguntas llegan en mensajes separados, debes clasificarlas de manera individual y precisa, respondiendo en la sección correspondiente del chat a medida que se reciben las preguntas.
    
          IMPORTANTE: 
          Retornar SOLO el o los códigos de categoría de las preguntas que se le hicieron, NUNCA RETORNAR MAS TEXTO, SOLO UN ARREGLO. El formato de la respuesta debe ser el siguiente:
          Ejemplo: [1, 2, 3, 4, 5, 6], donde cada numero representa el codigo de categoria de cada pregunta que se le hizo.
          Ejemplo: [1, 2, 3, 4, 5, 0], donde cada numero representa el codigo de categoria de cada pregunta que se le hizo, pero en este caso la ultima pregunta no esta en el contexto de xicam, por lo que se retorna un 0.
          Ejemplo: [1, 2, 3, 4, 5, 6, 0], donde cada numero representa el codigo de categoria de cada pregunta que se le hizo, pero en este caso la ultima pregunta no esta en el contexto de xicam, por lo que se retorna un 0.
          Ejemplo: [1, 2, 3, 4, 5, 6, 0, 0], donde cada numero representa el codigo de categoria de cada pregunta que se le hizo, pero en este caso las ultimas dos preguntas no estan en el contexto de xicam, por lo que se retorna un 0.
          En caso de que se le haga una pregunta que no esta en el contexto de xicam, retornar un arreglo con un 0.
          En caso de que en una pregunta existan varias categorias, retornar un arreglo con los codigos de las categorias correspondientes, pero si a demas todas esas preguntas incluyen un 0, retornar solo un 0.
          `,
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const predictedCategory = response.data.choices[0].message.content;

  console.log("predictedCategory", predictedCategory);
  console.log("predictedCategory content", response.data.choices[0].message);
  return 0;
};

const handleResponseInBackground = async (thread_id, run_id) => {
  let runStatus;
  let attempts = 0;
  const maxAttempts = 12;
  const interval = 2500;

  do {
    try {
      const [statusResponse, messagesResponse] = await Promise.all([
        openAi.get(
          `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`
        ),
        openAi.get(`https://api.openai.com/v1/threads/${thread_id}/messages`),
      ]);

      runStatus = statusResponse.data.status;
      if (runStatus === "completed") {
        return messagesResponse.data;
      }
    } catch (error) {
      console.error("Error retrieving response:", error.response.data.error);
      return { error: "Error retrieving response" };
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  } while (runStatus !== "completed" && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    return { error: "Timeout: La respuesta del asistente tardó demasiado." };
  }
};

module.exports = {
  handleCreateAssistant,
  handleClassifyQuestion,
  handleResponseInBackground,
};
