const { productsInfoSchemaDescription } = require("../../utils/static");

const productsInfoSchema = {
  type: "function",
  function: {
    name: "handleProductsInfo",
    description: productsInfoSchemaDescription,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

module.exports = { productsInfoSchema };
