#!/bin/bash

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

APP_DIR="/opt/contact-form-handler"
SERVICE_FILE="contact-form-handler.service"
SYSTEMD_PATH="/etc/systemd/system/$SERVICE_FILE"

if [ -f .env ]; then

  echo "Creating application directory at $APP_DIR..."
  install -d "$APP_DIR"
  echo "Copying .env to $APP_DIR..."
  install -m 600 .env "$APP_DIR/"
else
  echo "ERROR: .env file not found in current directory. Please create and configure .env before installing."
  exit 1
fi



echo "Copying server.js to $APP_DIR..."
install -m 644 server.js "$APP_DIR/"

echo "Copying $SERVICE_FILE to $SYSTEMD_PATH..."
install -m 644 "$SERVICE_FILE" "$SYSTEMD_PATH"

echo "Reloading systemd daemon..."
systemctl daemon-reload

echo "Enabling contact-form-handler service..."
systemctl enable contact-form-handler

echo "Starting contact-form-handler service..."
systemctl restart contact-form-handler

echo "Showing service status:"
systemctl status contact-form-handler --no-pager