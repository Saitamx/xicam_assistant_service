const {
  handleReservationSchema,
  handleShowMapSchema,
} = require("./utils/toolsFunctionsSchemas");
const { openAi } = require("./utils/instances");
const { default: axios } = require("axios");
const FormData = require("form-data");
const {
  handleCreateAssistantPrompt,
  handleClassifyQuestionPrompt,
} = require("./utils/promts");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

const toolsFunctions = [handleReservationSchema, handleShowMapSchema];

const tools = [{ type: "retrieval" }, ...toolsFunctions];

const handleReservation = async (functionArguments) => {
  console.time("handleReservation");

  let { fullName, email, phone, avaliableTime, avaliableDays } =
    functionArguments;

  if (!fullName || !email || !phone || !avaliableTime || !avaliableDays) {
    return { error: "Faltan datos para realizar la reserva." };
  }

  try {
    const response = await axios.post(
      process.env.MAKE_WEBHOOK_RESERVATION,
      functionArguments
    );
    console.log("handleReservation: response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error making reservation:",
      error?.response?.data?.error || error?.response?.data || error?.response
    );
  }
  console.timeEnd("handleReservation");
};

const handleShowMap = () => {
  console.time("handleShowMap");
  console.timeEnd("handleShowMap");
  return true;
};

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
        tools,
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
  let runStatus;
  let attempts = 0;
  const maxAttempts = 20;
  const interval = 2500;

  let showMap = false;

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
        return { response: messagesResponse.data, showMap };
      } else if (runStatus === "requires_action") {
        console.log("Action required.");
        const requiredAction =
          statusResponse.data.required_action.submit_tool_outputs.tool_calls;
        console.log("requiredAction", requiredAction);
        let toolsOutputs = [];
        for (const action of requiredAction) {
          const funcName = action.function.name;
          const functionArguments = JSON.parse(action.function.arguments);
          if (funcName === "handleReservation") {
            const output = await handleReservation(functionArguments);
            console.log("handleReservation: output", output);
            toolsOutputs.push({
              tool_call_id: action.id,
              output: JSON.stringify(output),
            });
          } else if (funcName === "handleShowMap") {
            const output = handleShowMap(functionArguments);
            console.log("handleShowMap: output", output);
            showMap = true;
            toolsOutputs.push({
              tool_call_id: action.id,
              output: JSON.stringify(output),
            });
          } else {
            console.error("Unknown function:", funcName);
          }
        }
        await openAi.post(
          `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}/submit_tool_outputs`,
          {
            tool_outputs: toolsOutputs,
          }
        );
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
