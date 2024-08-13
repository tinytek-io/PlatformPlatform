import nodemailer from "nodemailer";
import { config } from "./config";

export const smtpServer = nodemailer.createTransport({
  port: Number.parseInt(config.env.EMAIL_PORT, 10),
  host: config.env.EMAIL_HOST,
  secure: config.env.EMAIL_SECURE,
  auth: {
    user: config.env.EMAIL_USER,
    pass: config.env.EMAIL_PASS
  }
});
