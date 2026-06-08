# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Install system dependencies required for packages like psycopg2, tesseract, or uxml
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install Python dependencies
# Using --no-cache-dir keeps the container size smaller
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Run collectstatic to gather static files for WhiteNoise
RUN python manage.py collectstatic --noinput

# Expose port 7860 (Hugging Face Spaces explicitly requires port 7860)
EXPOSE 7860

# Start the application using Gunicorn binding to port 7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "legifybackend.wsgi:application"]