# 🚀 Xicam Assistants Service

## 📜 Description

Xicam Assistants Service is a cutting-edge backend application, expertly crafted to interact with OpenAI's Language Model (LLM). It's designed to handle, categorize, and respond to customer inquiries with precision and efficiency. Built using Node.js, Express, and Socket.io, it offers a robust and interactive platform for seamless customer service experiences.

## 🔧 Installation

1. Clone the repository.
2. Install dependencies: `npm install`.

## 🚀 Usage

- Launch the server: `npm start`.
- Access at `http://localhost:3000`.

## 💡 Key Features

- 🌐 Real-time client communication via Socket.io.
- 🧠 Integration with OpenAI's API for intelligent inquiry processing.
- 📊 Structured JSON responses for categorized inquiries.
- 🔑 Environment variables for API keys and flexible configuration.

## 🌐 Endpoints

- `/newAssistant`: Initiates a new assistant and thread for inquiry management.
- `/newMessage`: Processes customer messages through OpenAI's API and returns categorized, structured responses.

## ⚙️ Custom Configuration

- Developers should create their own knowledge documents.
- Prompts need to be tailored to the specific context of each project.

## 🌍 Environment Variables

Set up in a `.env` file:

- `OPENAI_API_KEY`: Your OpenAI API key.
- `THREAD_ID`: Thread ID for OpenAI conversations.
- `ASSISTANT_ID`: Assistant ID.

## 📄 License

Under the MIT License.
