const {
  reservationSchema,
  generalInfoSchema,
  productsInfoSchema,
} = require("./schemas");

const tools = [reservationSchema, generalInfoSchema, productsInfoSchema];

module.exports = { tools };
