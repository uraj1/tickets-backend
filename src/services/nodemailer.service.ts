import { createTransport } from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

export async function sendEmail(email: string, subject: string, body: string) {
  const info = await transporter
    .sendMail({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      text: body,
    })
    .catch(console.error);

  return info ? info.messageId : null;
}
