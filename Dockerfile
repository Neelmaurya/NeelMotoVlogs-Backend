FROM python:3.12-slim

# Install basic system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    gnupg \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Caddy (directly download the compiled binary for amd64)
RUN curl -sSLo /usr/bin/caddy "https://caddyserver.com/api/download?os=linux&arch=amd64" \
    && chmod +x /usr/bin/caddy

WORKDIR /app

# 1. Install Backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# 2. Install Frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./frontend/

# Build Next.js app
RUN cd frontend && npm run build

# 3. Setup runner configuration
COPY Caddyfile ./
COPY start.sh ./
RUN chmod +x start.sh

# Expose standard Railway port
EXPOSE 8080

CMD ["./start.sh"]
