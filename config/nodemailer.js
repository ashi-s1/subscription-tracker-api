import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';

export const accountEmail = 'sweetpoison23r@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD ? EMAIL_PASSWORD.replace(/\s+/g, '') : '',
  },
});

export default transporter;