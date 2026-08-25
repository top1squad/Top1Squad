const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_GMAIL@gmail.com",
    pass: "YOUR_GMAIL_APP_PASSWORD",
  },
});

const sendEmailOtp = async (email, otp) => {
  return await transporter.sendMail({
    from: "YOUR_GMAIL@gmail.com",
    to: email,
    subject: "Tournament Arena - OTP Verification",
    text: `Your Tournament Arena OTP is ${otp}. This OTP is valid for 10 minutes.`,
  });
};

module.exports = sendEmailOtp;