import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const otpMap = new Map(); // Temporary storage. Use Redis for production.

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const ses = new AWS.SES();

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpMap.set(email, otp); // In-memory storage

  otpMap.set(email, otp);

    setTimeout(() => {
        otpMap.delete(email);
            }, 10 * 60 * 1000); // 10 minutes


  const params = {
    Source: process.env.SES_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Your OTP Code' },
      Body: {
        Text: { Data: `Your OTP is ${otp}. It expires in 10 minutes.` },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
  console.error('SES Error:', err.message, err.code, err.stack); // full trace
  res.status(500).json({
    success: false,
    message: 'Failed to send OTP',
    error: err.message,
  });
}
};

export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const savedOtp = otpMap.get(email);
  if (savedOtp && savedOtp === otp) {
    otpMap.delete(email);
    return res.json({ success: true, message: 'OTP verified' });
  }
  res.status(400).json({ success: false, message: 'Invalid OTP' });
};
