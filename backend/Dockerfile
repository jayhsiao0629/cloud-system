# Use the official Python runtime as a parent image
FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1  
ENV PYTHONUNBUFFERED=1         
ENV FLASK_ENV=development       

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the listening port
EXPOSE 5000

# Run in development mode using Flask CLI
CMD ["./entrypoint.sh"]
# CMD ["flask", "--app", "flaskr", "run", "--debug", "--host", "0.0.0.0", "--port", "5000"]