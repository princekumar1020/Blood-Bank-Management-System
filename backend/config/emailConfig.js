import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const initializeTransporter = () => {
  if (!transporter) {
    console.log('Initializing transporter with:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? '***' : 'NOT SET'
    });
    try {
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = Number(process.env.EMAIL_PORT) || 587;
      const useSecure = emailPort === 465;

      transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: useSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log('Transporter initialized successfully');
    } catch (err) {
      console.error('Error initializing transporter:', err);
      throw err;
    }
  }
  return transporter;
};

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailer = initializeTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error?.message || String(error) };
  }
};

export { initializeTransporter };