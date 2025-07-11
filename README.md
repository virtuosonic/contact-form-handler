# contact-form-handler
A simple Node.js application to handle contact form submissions. Specialy helpful for using with nginx that isn't intended to run scripts. It uses Express.js for the server and Nodemailer for sending emails.

# Contact Form Handler

## Environment Variables (`.env`)

Create a `.env` file in your project root with the following variables:

```
# SMTP server configuration
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword

# Recipient email address
SMTP_TO=recipient@email.com

# (Optional) Server port
PORT=8080
```

**Notes:**
- Never commit your `.env` file to version control. Add `.env` to your `.gitignore`.
- All sensitive credentials (SMTP user, password, etc.) are loaded from this file at runtime.
- The `SMTP_TO` address is where contact form submissions will be sent.
- The `PORT` variable is optional; defaults to `8080` if not

## Usage

```
npm install
npm start
```

## License
Copyright 2024 Gabriel Espinoza

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

