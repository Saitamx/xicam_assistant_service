const axios = require("axios");
require("dotenv").config();

const openAi = axios.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "OpenAI-Beta": "assistants=v1",
  },
  maxBodyLength: Infinity,
});
console.log("Instancia de Axios creada");

module.exports = { openAi };
