const handleReservationSchema = {
  type: "function",
  function: {
    name: "handleReservation",
    description: `
          Crea una reserva de atención para el cliente, se inicia solo cuando se tienen todos los datos necesarios para realizar la reserva y luego de tener la confirmación del cliente.

          Ejemplos de preguntas:
          Quiero una cita
          Quiero una reserva
          Quiero una cita para hoy
          Quiero una reserva para hoy
          Quiero una cita para mañana
          Quiero una reserva para mañana
          Quiero una cita para el lunes
          Quiero una reserva para el lunes
          Me gustaría una cita
          Me gustaría una reserva
          Me gustaría una cita para hoy¿
          ¿Como hago una cita?
          ¿Como hago una reserva?

          Palabras clave: cita, reserva, reservar, agendar, agendar cita, agendar reserva.
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
          Se inicia cuando el usuario quiere saber la dirección de la empresa.
          Ejemplos de preguntas: 
          ¿Dónde están ubicados?
          ¿Cuál es su dirección?
          ¿Dónde queda su empresa?
          ¿Como llego a su empresa?
          ¿Como llego a su oficina?
          ¿Tienen una sucursal?
          ¿Tienen una sucursal en otra ciudad?

          Palabras clave: dirección, ubicación, sucursal, oficina, ciudad, llegar, mapa, google maps, googlemaps, googlemap, google map, maps, map
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
