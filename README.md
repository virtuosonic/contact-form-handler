# Contact Form Handler with reCAPTCHA v3

A Node.js service that handles contact form submissions with email delivery via SMTP and reCAPTCHA v3 protection against spam and bots.

## Features

- ✅ Contact form processing with email delivery
- ✅ reCAPTCHA v3 integration for bot protection
- ✅ SSL/HTTPS support
- ✅ Input validation and sanitization
- ✅ Configurable via environment variables
- ✅ Systemd service integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# SMTP Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password
SMTP_TO=recipient@domain.com

# SSL Certificate Paths
SSL_KEY_PATH=/path/to/your/private.key
SSL_CERT_PATH=/path/to/your/certificate.crt

# Server Configuration
PORT=8443

# reCAPTCHA v3 Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
RECAPTCHA_MIN_SCORE=0.5
```
If you have problem with authentication try putting the value quoted ""

### 3. reCAPTCHA v3 Setup

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Create a new site with reCAPTCHA v3
3. Add your domain(s) to the allowed domains
4. Copy the **Secret Key** to your `.env` file as `RECAPTCHA_SECRET_KEY`
5. Copy the **Site Key** for use in your frontend forms

### 4. Frontend Integration

Use the provided `sample-form.html` as a reference for integrating reCAPTCHA v3 in your frontend forms. Key points:

- Include the reCAPTCHA script: `<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>`
- Execute reCAPTCHA before form submission: `grecaptcha.execute(SITE_KEY, {action: 'submit'})`
- Include the token in your form data as `recaptchaToken`

## API Endpoints

### POST /form

Handles contact form submissions with reCAPTCHA verification.

**Request Body:**
```json
{
  "name": "John Doe",
  "mail": "john@example.com", 
  "subject": "Contact Request",
  "message": "Hello, I'd like to get in touch.",
  "recaptchaToken": "recaptcha_token_from_frontend"
}
```

**Response:**
- `200 OK`: Message sent successfully
- `400 Bad Request`: Invalid input or reCAPTCHA verification failed
- `500 Internal Server Error`: Server error

## Configuration Options

### reCAPTCHA Settings

- `RECAPTCHA_SECRET_KEY`: Your reCAPTCHA v3 secret key (required)
- `RECAPTCHA_MIN_SCORE`: Minimum score threshold (0.0-1.0, default: 0.5)

### SMTP Settings

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username/email
- `SMTP_PASS`: SMTP password
- `SMTP_TO`: Recipient email address

### SSL Settings

- `SSL_KEY_PATH`: Path to SSL private key file
- `SSL_CERT_PATH`: Path to SSL certificate file
- `PORT`: Server port (default: 8443)

## Installation as System Service

### 1. Install the Service

```bash
sudo ./install.sh
```

### 2. Start the Service

```bash
sudo systemctl start contact-form-handler
sudo systemctl enable contact-form-handler
```

### 3. Check Service Status

```bash
sudo systemctl status contact-form-handler
```

## Security Features

- **reCAPTCHA v3**: Invisible bot protection with score-based verification
- **Input Validation**: Length and format validation for all fields
- **HTTPS**: SSL/TLS encryption for all communications
- **IP Tracking**: Client IP tracking for reCAPTCHA verification

## Troubleshooting

### Common Issues

1. **reCAPTCHA verification fails**
   - Check that your secret key is correct
   - Verify the domain is added to reCAPTCHA admin console
   - Ensure the token is being sent correctly from frontend

2. **Email not sending**
   - Verify SMTP credentials
   - Check firewall settings for SMTP port
   - Ensure SSL certificate paths are correct

3. **Service won't start**
   - Check environment variables are set correctly
   - Verify SSL certificate files exist and are readable
   - Check logs: `sudo journalctl -u contact-form-handler`

### Logs

View service logs:
```bash
sudo journalctl -u contact-form-handler -f
```

## Development

### Running Locally

```bash
npm start
```

### Testing

You can test the form using the provided `sample-form.html` file. Make sure to:

1. Replace `YOUR_RECAPTCHA_SITE_KEY` with your actual site key
2. Update the form action URL if needed
3. Ensure your server is running on the expected port

## License

This project is open source and available under the MIT License.

