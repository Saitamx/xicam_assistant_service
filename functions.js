const { openAi } = require("./utils/instances");
const FormData = require("form-data");
const {
  handleCreateAssistantPrompt,
  handleClassifyQuestionPrompt,
} = require("./utils/promts");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

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
    fileFormData.append(
      "file",
      fs.createReadStream("knowledge_xicam_service.docx")
    );
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
        instructions: handleCreateAssistantPrompt,
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
  console.time("handleClassifyQuestion");
  const response = await openAi.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: handleClassifyQuestionPrompt,
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
  console.timeEnd("handleClassifyQuestion");
  return predictedCategory;
};

const handleResponseInBackground = async (thread_id, run_id) => {
  console.time("handleResponseInBackground");
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
  console.timeEnd("handleResponseInBackground");
};

module.exports = {
  handleCreateAssistant,
  handleClassifyQuestion,
  handleResponseInBackground,
};
