# AI Test Case Generator ✨

A simple web application that takes user-provided code as input and uses the Google Gemini AI API (via Google AI Studio) to generate diverse test cases (positive, negative, edge cases).


## Features

*   Takes code input via a text area.
*   Allows specifying the programming language (optional, improves AI results).
*   Sends the code to a Node.js backend.
*   Uses the Google Generative AI SDK (`@google/generative-ai`) to interact with the Gemini API.
*   Prompts the AI to generate positive, negative, and edge test cases.
*   Displays the generated test cases on the frontend.
*   Basic loading and error handling indicators.

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript (Vanilla)
*   **Backend:** Node.js, Express.js
*   **AI:** Google Gemini API (via Google AI Studio)
*   **Google AI SDK:** `@google/generative-ai`
*   **Environment Variables:** `dotenv`
*   **CORS Handling:** `cors`

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Node.js and npm:** Installed on your system ([Download Node.js](https://nodejs.org/))
*   **Git:** Installed on your system ([Download Git](https://git-scm.com/))
*   **Google AI Studio API Key:** You need an API key from [Google AI Studio](https://aistudio.google.com/).

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```
    *(Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME`)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    *   Create a file named `.env` in the root directory of the project.
    *   Add your Google AI Studio API key to this file:
      ```dotenv
      # .env
      GOOGLE_API_KEY=YOUR_API_KEY_HERE
      ```
    *   **Important:** Replace `YOUR_API_KEY_HERE` with your actual API key. **Do not commit the `.env` file to Git.** The included `.gitignore` file should prevent this automatically.

## Running the Application

1.  **Start the backend server:**
    ```bash
    node server.js
    ```
    You should see output indicating the server is running, usually on port 3000:
    ```
    🚀 Server listening on port 3000
    🔗 Access the application at: http://localhost:3000
    🔑 Ensure your GOOGLE_API_KEY is correctly set in the .env file.
    ```

2.  **Access the application:**
    *   Open your web browser and navigate to `http://localhost:3000`.

## How to Use

1.  Paste the code snippet you want to generate test cases for into the "Enter your code" text area.
2.  (Optional) Enter the programming language of the code (e.g., `javascript`, `python`, `java`) in the "Code Language" input field. This helps the AI generate more relevant tests.
3.  Click the "Generate Test Cases" button.
4.  Wait for the AI to process the request (you'll see a loading indicator).
5.  The generated test cases will appear in the "Generated Test Cases" section below. Error messages will be displayed if something goes wrong.

## Security Note 🔒

*   Your `GOOGLE_API_KEY` is sensitive. Keep it secret!
*   The `.env` file is used to store this key securely outside of the codebase.
*   The `.gitignore` file ensures that `node_modules/` and `.env` are **not** uploaded to GitHub. Always double-check this before committing.