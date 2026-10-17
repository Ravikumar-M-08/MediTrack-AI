import twilio from "twilio";

let client = null;

// Create the client lazily so dotenv has already loaded
const getClient = () => {
  if (client) return client;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio credentials missing in .env");
  }
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
};

const formatPhoneNumber = (number) => {
  const cleaned = ("" + number).replace(/\D/g, "");
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (String(number).startsWith("+") && cleaned.length >= 11 && cleaned.length <= 15) {
    return number;
  }
  return null;
};

export const sendReminderSMS = async (phoneNumber, patientName, time) => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  if (!formattedNumber) {
    console.warn(`⚠️ Skipping ${patientName}: invalid phone (${phoneNumber})`);
    return { success: false, error: "Invalid phone number format" };
  }

  try {
    const response = await getClient().messages.create({
      body: `Hi ${patientName}, you have an appointment tomorrow at ${time}. We look forward to seeing you! - Medicare AI`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
    console.log(`✅ SMS sent to ${patientName} (${formattedNumber}) sid=${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error(`❌ Twilio error for ${patientName}:`, error.message);
    return { success: false, error: error.message };
  }
};