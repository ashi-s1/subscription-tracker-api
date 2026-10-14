import dayjs from 'dayjs';
import { emailTemplates } from './email-template.js';
import transporter, { accountEmail } from '../config/nodemailer.js';

export const sendReminderEmail = async ({ to, type, subscription, subscriptions }) => {
  const sub = subscription || subscriptions;
  if (!to || !type) throw new Error('Missing required parameters');
  if (!sub) throw new Error('Subscription parameter is required');

  const template = emailTemplates.find((t) => t.label === type);
  if (!template) throw new Error(`Invalid email type: ${type}`);

  const userName =
    typeof sub.user === 'object' && sub.user?.name
      ? sub.user.name
      : 'Valued Customer';

  const mailInfo = {
    userName,
    subscriptionName: sub.name,
    renewalDate: dayjs(sub.renewalDate).format('MMM D, YYYY'),
    planName: sub.name,
    price: `${sub.currency} ${sub.price} (${sub.frequency})`,
    paymentMethod: sub.paymentMethod,
    accountSettingsLink: '#',
    supportLink: '#',
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + (info.response || info.messageId));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};