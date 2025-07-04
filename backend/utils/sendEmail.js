import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sendBookingStatusEmail = async ({ toEmail, userName, booking, status, reason }) => {
  const subject = `Booking ${status === 'approved' ? 'Approved' : 'Rejected'} - ${booking.roomId.name}`;
  const reasonBlock = status === 'rejected' ? `<p><strong>Reason:</strong> ${reason}</p>` : '';

  const htmlBody = `
    <p>Hello ${userName},</p>
    <p>Your booking for <strong>${booking.roomId.name}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
    ${reasonBlock}
    <p><strong>Booking Details:</strong></p>
    <ul>
      <li><strong>Room:</strong> ${booking.roomId.name}</li>
      <li><strong>Location:</strong> ${booking.roomId.location || 'N/A'}</li>
      <li><strong>Start:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
      <li><strong>End:</strong> ${new Date(booking.endTime).toLocaleString()}</li>
    </ul>
    <p>Thank you,<br/>Vinsys Team</p>
  `;

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: { Html: { Data: htmlBody } },
      Subject: { Data: subject },
    },
    Source: process.env.SES_EMAIL,
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
};
