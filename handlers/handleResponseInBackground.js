const { handleReservation } = require("./handleReservation");
const { handleGeneralInfo } = require("./handleGeneralInfo");
const { handleProductsInfo } = require("./handleProductsInfo");
const { openAi } = require("../utils/instances");

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
          } else if (funcName === "handleGeneralInfo") {
            const output = handleGeneralInfo(functionArguments);
            console.log("handleGeneralInfo: output", output);
            showMap = true;
            toolsOutputs.push({
              tool_call_id: action.id,
              output: JSON.stringify(output),
            });
          } else if (funcName === "handleProductsInfo") {
            const output = handleProductsInfo(functionArguments);
            console.log("handleProductsInfo: output", output);
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

module.exports = { handleResponseInBackground };
