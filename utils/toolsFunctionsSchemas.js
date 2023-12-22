const handleReservationSchema = {
  type: "function",
  function: {
    name: "handleReservation",
    description: `
          Crea una reserva de atención para el cliente.
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

module.exports = {
  handleReservationSchema,
};
