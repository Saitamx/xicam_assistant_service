const { classifyQuestionInstructions } = require("../utils/static");
const axios = require("axios");
const openAi = axios.create();

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
          content: classifyQuestionInstructions,
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

module.exports = { handleClassifyQuestion };
