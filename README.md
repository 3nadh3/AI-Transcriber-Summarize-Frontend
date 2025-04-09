# AI-Transcriber-Summarize-Frontend

AI Transcriber & Summarizer is a smart web application that allows users to extract meaningful summaries from text, PDF, YouTube videos, video files, and audio content. It uses advanced AI models (via a backend API) to transcribe and summarize content in different formats, providing concise, core, or bullet-point summaries for quick understanding.

**🚀 Live Demo:** [https://transcripto-ai.netlify.app/](https://transcripto-ai.netlify.app/)

## 🔍 Features

* **✍️ Text Summarization:** Paste custom text directly into the interface or upload `.txt` files to get AI-powered summaries.
* **🔊 YouTube Transcriber & Summarizer:** Simply enter a YouTube video URL to have its audio transcribed (via backend) and then summarized.
* **📹 Video/Audio File Support:** Upload local video and audio files (various formats supported by the backend) to get transcriptions and summaries.
* **🧠 Summary Modes:** Choose the level of detail for your summary:
    * **Core:** A very brief and essential summary.
    * **Concise:** A more detailed and comprehensive summary.
    * **Bullet Points:** Key information presented in an easy-to-read bulleted list.
* **⚡ Real-time Feedback:**
    * **Word Count Checker:** See the word count of your input text in real-time.
    * **Input Validation:** Clear warning messages (e.g., for insufficient text length) to guide the user.
* **✨ User-Friendly Interface:** A clean and intuitive design for a seamless user experience.
* **🔄 Re-Summarize Option:** Easily generate a new summary with a different summary level without re-entering the text or uploading the file.
* **⚙️ Backend Integration:** Communicates with a backend API (likely built with Node.js and utilizing AI models like OpenAI or similar) to handle transcription and summarization tasks.

## 🛠️ Technologies Used

* **React:** A JavaScript library for building user interfaces.
* **Axios:** A promise-based HTTP client for making API requests to the backend.
* **CSS:** For styling the application.
* **Netlify:** Used for hosting the live demo.

## ⚙️ Setup (for Developers)

If you want to run this frontend locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/3nadh3/AI-Transcriber-Summarize-Frontend.git
    cd AI-Transcriber-Summarize-Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Backend URL:**
    * Open the `src/App.js` file.
    * Locate the `API_BASE_URL` constant (it's likely defined near the top).
    * **Update this URL to point to your locally running backend API.** For example:
        ```javascript
        const API_BASE_URL = "http://localhost:5000";
        ```

4.  **Start the application:**
    ```bash
    npm start
    # or
    yarn start
    ```

    This will start the development server, and you can view the application in your browser (usually at `http://localhost:3000`).

## 🔗 Backend Repository

This frontend application relies on a backend API to perform the heavy lifting of transcription and summarization. You can find the backend repository (with setup instructions) here:
