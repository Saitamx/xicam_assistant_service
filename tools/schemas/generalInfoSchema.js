const { generalInfoSchemaDescription } = require("../../utils/static");

const generalInfoSchema = {
  type: "function",
  function: {
    name: "handleGeneralInfo",
    description: generalInfoSchemaDescription,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

module.exports = { generalInfoSchema };
