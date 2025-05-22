const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,      // Your Gmail address
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,     // App Password
  },
});

module.exports = transport;
