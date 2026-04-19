#!/bin/bash

# Production startup script for AWS EC2
# This sets up systemd services for production deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RDS_HOST=${RDS_HOST:-"briva-diena-db.c10oq8we434z.eu-north-1.rds.amazonaws.com"}
RDS_USER=${RDS_USER:-"briva_diena_user"}
RDS_PASSWORD=${RDS_PASSWORD:-"briva_diena_password"}

echo ""
echo "============================================"
echo "  Setting up production environment"
echo "============================================"
echo ""

# 1. Create application.yaml for backend
echo "Creating application configuration..."
cat > "$SCRIPT_DIR/backend/src/main/resources/application.yaml" << EOF
spring:
  datasource:
    url: jdbc:mariadb://$RDS_HOST:3306/briva_diena
    username: $RDS_USER
    password: $RDS_PASSWORD
  jpa:
    hibernate:
      ddl-auto: none
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

app:
  uploads-path: /var/uploads
  images-path: /var/images
EOF
echo "[OK] Application configuration created"

# 2. Build backend
echo ""
echo "Building backend..."
cd "$SCRIPT_DIR/backend"
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "[ERROR] Backend build failed"
    exit 1
fi
echo "[OK] Backend built successfully"

# 3. Build frontend
echo ""
echo "Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "[ERROR] Frontend build failed"
    exit 1
fi
echo "[OK] Frontend built successfully"

# 4. Create directories for app
echo ""
echo "Creating application directories..."
sudo mkdir -p /var/www/briva-diena
sudo mkdir -p /var/uploads
sudo mkdir -p /var/images
sudo chown ubuntu:ubuntu /var/uploads /var/images
echo "[OK] Directories created"

# 5. Deploy frontend
echo ""
echo "Deploying frontend..."
sudo cp -r "$SCRIPT_DIR/frontend/dist"/* /var/www/briva-diena/
echo "[OK] Frontend deployed to /var/www/briva-diena"

# 6. Create systemd service for backend
echo ""
echo "Creating systemd service for backend..."
sudo tee /etc/systemd/system/briva-diena-backend.service > /dev/null << EOF
[Unit]
Description=Brīva Diena Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$SCRIPT_DIR/backend
ExecStart=/usr/bin/java -jar target/backend-*.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="SPRING_DATASOURCE_URL=jdbc:mariadb://$RDS_HOST:3306/briva_diena"
Environment="SPRING_DATASOURCE_USERNAME=$RDS_USER"
Environment="SPRING_DATASOURCE_PASSWORD=$RDS_PASSWORD"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "[OK] Backend service created"

# 7. Create Nginx configuration
echo ""
echo "Creating Nginx reverse proxy configuration..."
sudo tee /etc/nginx/sites-available/briva-diena > /dev/null << 'NGX_EOF'
server {
    listen 80 default_server;
    server_name _;

    # Frontend
    location / {
        root /var/www/briva-diena;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        alias /var/uploads;
    }
}
NGX_EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/briva-diena /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "[OK] Nginx configured"
else
    echo "[ERROR] Nginx configuration test failed"
    exit 1
fi

# 8. Summary
echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Start backend service:"
echo "   sudo systemctl start briva-diena-backend"
echo "   sudo systemctl enable briva-diena-backend"
echo ""
echo "2. Start Nginx:"
echo "   sudo systemctl start nginx"
echo "   sudo systemctl enable nginx"
echo ""
echo "3. Check status:"
echo "   sudo systemctl status briva-diena-backend"
echo "   systemctl status nginx"
echo ""
echo "4. View logs:"
echo "   sudo journalctl -u briva-diena-backend -f"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""
