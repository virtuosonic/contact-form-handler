require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// reCAPTCHA v3 verification function
async function verifyRecaptcha(token, remoteip) {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: remoteip
      })
    });

    const data = await response.json();
    return data.success && data.score >= parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

app.post('/form', async (req, res) => {
  const { name, mail, subject, message, recaptchaToken } = req.body;

  // Basic field length validation
  if (
    !name || name.length < 2 || name.length > 100 ||
    !mail || mail.length < 5 || mail.length > 100 ||
    !subject || subject.length < 2 || subject.length > 150 ||
    !message || message.length < 5 || message.length > 2000
  ) {
    return res.status(400).send('<h1>Invalid form input length.</h1>');
  }

  // Verify reCAPTCHA token
  if (!recaptchaToken) {
    return res.status(400).send('<h1>reCAPTCHA token is required.</h1>');
  }

  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, clientIP);
  
  if (!isRecaptchaValid) {
    return res.status(400).send('<h1>reCAPTCHA verification failed.</h1>');
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

const PORT = process.env.PORT || 8443;

// Load SSL certificate and key from environment variables
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

https.createServer(sslOptions, app).listen(PORT,'0.0.0.0', () => {
  console.log(`Secure server running on port ${PORT}`);
});