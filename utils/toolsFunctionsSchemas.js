const handleReservationSchema = {
  type: "function",
  function: {
    name: "handleReservation",
    description: `
          Crea una reserva de atención para el cliente, se inicia solo cuando se tienen todos los datos necesarios para realizar la reserva y luego de tener la confirmación del cliente.
          `,
    parameters: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Nombre completo del cliente.",
        },
        email: {
          type: "string",
          description: "Correo electrónico del cliente.",
        },
        phone: {
          type: "string",
          description: "Número de teléfono del cliente.",
        },
        avaliableTime: {
          type: "string",
          description: "Horario de atención del cliente.",
        },
        avaliableDays: {
          type: "string",
          description:
            "Días de atención del cliente. ejemplo: 'Lunes a Viernes'",
        },
      },
      required: [
        "fullName",
        "email",
        "phone",
        "avaliableTime",
        "avaliableDays",
      ],
    },
  },
};

const handleShowMapSchema = {
  type: "function",
  function: {
    name: "handleShowMap",
    description: `
          Se inicia quiere saber la dirección de la empresa.
          `,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

module.exports = {
  handleReservationSchema,
  handleShowMapSchema,
};
