require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const https = require("https");
const fetch = require("node-fetch");
const multer = require('multer');
const upload = multer();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS middleware: allow origin based on Host header
app.use((req, res, next) => {
  const hostHeader = req.headers.host || "";
  const domain = hostHeader.split(":")[0];
  res.setHeader("Access-Control-Allow-Origin", `https://${domain}`);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// reCAPTCHA v3 verification function
async function verifyRecaptcha(token, remoteip) {
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: remoteip,
        }),
      }
    );

    const data = await response.json();
    return (
      data.success &&
      data.score >= parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5")
    );
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

app.post("/form", upload.none(), async (req, res) => {
  const { name, mail, subject, message, recaptchaToken } = req.body;

  // Basic field length validation
  if (
    !name ||
    name.length < 2 ||
    name.length > 100 ||
    !mail ||
    mail.length < 5 ||
    mail.length > 100 ||
    !subject ||
    subject.length < 2 ||
    subject.length > 150 ||
    !message ||
    message.length < 5 ||
    message.length > 2000
  ) {
    console.log("Invalid form input:", { name, mail, subject, message });
    return res.status(400).json({ success: false, error: "Tamaño no valido." });
  }

  // Verify reCAPTCHA token
  if (!recaptchaToken) {
    console.log("reCAPTCHA token is missing");
    return res.status(400).json({ success: false, error: "reCAPTCHA token is required." });
  }

  const clientIP =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, clientIP);

  if (!isRecaptchaValid) {
    console.log("reCAPTCHA verification failed for token:", recaptchaToken);
    return res.status(400).json({ success: false, error: "Verificación reCAPTCHA fallida." });
  }

  // Extract domain from Host header
  const hostHeader = req.headers.host || "";
  const domain = hostHeader.split(":")[0]; // Remove port if present

  // Configure your SMTP transport using environment variables
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log("Sending email with the following details:", {
      from: `"Web Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO,
      subject: `[${domain}] Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${mail}\n\n${message}`,
      replyTo: mail,
    });
    await transporter.sendMail({
      from: `"Web Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO,
      subject: `[${domain}] Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${mail}\n\n${message}`,
      replyTo: mail,
    });
    res.json({ success: true, message: "Gracias por su mensaje!" });
  } 
  catch (err) 
  {
    console.log('error sending message',err);
    res.status(500).json({ success: false, error: `Error enviando mensaje: ${err.message}` });
  }
});

const PORT = process.env.PORT || 8443;

// Load SSL certificate and key from environment variables
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Secure server running on port ${PORT}`);
});
