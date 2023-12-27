const { handleResponseInBackground } = require("./handleResponseInBackground");
const { handleClassifyQuestion } = require("./handleClassifyQuestion");
const { handleCreateAssistant } = require("./handleCreateAssistant");
const { handleReservation } = require("./handleReservation");
const { handleGeneralInfo } = require("./handleGeneralInfo");
const { handleProductsInfo } = require("./handleProductsInfo");

module.exports = {
  handleResponseInBackground,
  handleClassifyQuestion,
  handleCreateAssistant,
  handleReservation,
  handleGeneralInfo,
  handleProductsInfo,
};
