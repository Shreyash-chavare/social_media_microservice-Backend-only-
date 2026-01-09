🚀 Social Media Microservices Backend:
A backend-only social media system built using Node.js microservices architecture, designed to understand service isolation, scalability, event-driven communication, and API Gateway patterns.

📌 Why this project?
This project was built to deeply understand how real-world microservices work, including:
Independent services & databases
API Gateway pattern
Authentication across services
Event-driven communication using RabbitMQ
Logging & error handling per service

🎯 Goal: Learn how production-grade microservices are designed and managed

🧠 Architecture:
   ![Microservice Architecture](./microservice%20architecture.drawio.png)


🧩 Microservices Included:
  Service Name	          Description
🧑 Identity Service	      User auth, JWT, token management
📝 Post Service           Create & manage posts
📸 Media Service          Media upload handling
🔍 Search Service	       Search indexing & queries
🌐 API Gateway	           Single entry point

🛠 Tech Stack
Node.js
Express.js
MongoDB (Mongoose)
RabbitMQ
JWT for Auth.
Winston Logger
API Gateway Pattern

🚧 Future Improvements
Docker & Docker Compose
Kubernetes deployment
Circuit breaker pattern
