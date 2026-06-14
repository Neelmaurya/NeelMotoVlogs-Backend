FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install essential system dependencies (e.g., build tools, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first to leverage Docker build cache
COPY requirements.txt .

# Upgrade pip and install Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 8000 for the FastAPI server
EXPOSE 8000

# Command to start the application (runs the admin seed script first)
CMD ["sh", "-c", "python seed_admin.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
