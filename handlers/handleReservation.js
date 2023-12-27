const axios = require("axios");

const handleReservation = async (functionArguments) => {
  console.time("handleReservation");

  let { fullName, email, phone, avaliableTime, avaliableDays } =
    functionArguments;

  if (!fullName || !email || !phone || !avaliableTime || !avaliableDays) {
    return { error: "Faltan datos para realizar la reserva." };
  }

  try {
    const response = await axios.post(
      process.env.MAKE_WEBHOOK_RESERVATION,
      functionArguments
    );
    console.log("handleReservation: response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error making reservation:",
      error?.response?.data?.error || error?.response?.data || error?.response
    );
  }
  console.timeEnd("handleReservation");
};

module.exports = { handleReservation };
