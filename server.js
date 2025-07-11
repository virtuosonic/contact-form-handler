require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/form', async (req, res) => {
  const { name, mail, subject, message } = req.body;

  // Basic field length validation
  if (
    !name || name.length < 2 || name.length > 100 ||
    !mail || mail.length < 5 || mail.length > 100 ||
    !subject || subject.length < 2 || subject.length > 150 ||
    !message || message.length < 5 || message.length > 2000
  ) {
    return res.status(400).send('<h1>Invalid form input length.</h1>');
  }

  // Extract domain from Host header
  const hostHeader = req.headers.host || '';
  const domain = hostHeader.split(':')[0]; // Remove port if present

  // Configure your SMTP transport using environment variables
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Web Contact" <no-reply@${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO,
      subject: `[${domain}] Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${mail}\n\n${message}`,
      replyTo: mail
    });
    res.send('<h1>Thank you for your message!</h1>');
  } catch (err) {
    res.status(500).send(`<h1>Error sending message: ${err.message}</h1>`);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});