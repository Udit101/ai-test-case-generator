// server.js
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Often useful for serving static files robustly

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Use environment port or default to 3000

// --- Essential Middleware ---

// 1. Enable Cross-Origin Resource Sharing (CORS)
// Allows requests from your frontend (running on a different origin during development)
app.use(cors());

// 2. Parse incoming JSON request bodies
// Necessary to read the { code, language } object sent from the frontend
app.use(express.json());

// 3. Serve static files (HTML, CSS, JS) from the 'public' directory
// This makes your index.html accessible at the root URL (e.g., http://localhost:3000/)
app.use(express.static(path.join(__dirname, 'public')));

// --- Google AI Setup ---
const apiKey = process.env.GOOGLE_API_KEY;

// Validate API Key presence
if (!apiKey) {
    console.error("🔴 FATAL ERROR: GOOGLE_API_KEY not found in the .env file.");
    console.error("Please create a .env file in the project root and add your Google AI Studio API key:");
    console.error("GOOGLE_API_KEY=YOUR_API_KEY_HERE");
    process.exit(1); // Exit the application if the key is missing
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Using the faster/cheaper model, change if needed
    // Optional: Add safety settings if desired
    // safetySettings: [
    //   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //   // Add other categories as needed
    // ]
});

// --- API Endpoint for Generating Test Cases ---
app.post('/generate-tests', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received request on /generate-tests`);

    // 1. Extract code and language from request body
    const { code, language } = req.body;

    // 2. Basic Input Validation
    if (!code || typeof code !== 'string' || code.trim() === '') {
        console.warn("⚠️ Invalid input: Code is missing or empty.");
        // Send a user-friendly error back to the client
        return res.status(400).json({
            success: false,
            error: 'Code input cannot be empty. Please provide the code snippet.'
        });
    }

    // 3. Construct the Prompt for the Generative AI
    const langHint = language ? `The code is written in ${language}. ` : 'The code language is not specified. ';
    const prompt = `
You are an expert Test Case Generator AI.
Your task is to generate a comprehensive set of diverse test cases for the following code snippet.

${langHint}

**Instructions for Test Case Generation:**

1.  **Analyze the Code:** Understand its purpose, inputs, outputs, and potential logic branches.
2.  **Identify Test Categories:** Generate tests covering these categories:
    *   **Positive Cases:** Valid inputs that should produce expected successful outcomes.
    *   **Negative Cases:** Invalid inputs (wrong type, format, out of range) designed to test error handling or specific failure paths.
    *   **Edge Cases:** Boundary values (min/max), empty inputs (empty strings, empty arrays, nulls, undefined where applicable), zero values, very large/small numbers, etc.
    *   **(Optional) Performance Cases:** If relevant, suggest tests with large inputs to check for performance issues (though you won't execute them).
3.  **Format the Output Clearly:** Use Markdown for readability. Structure the tests logically (e.g., grouped by category). For each test case, clearly state:
    *   The **Input(s)**.
    *   The **Expected Output** or **Expected Behavior** (e.g., "throws TypeError", "returns empty array").
    *   (Optional) A brief **Description/Purpose** of the test case.

**Code Snippet to Analyze:**
\`\`\`${language || ''}
${code}
\`\`\`

**Generated Test Cases:**
`;

    console.log(`[${new Date().toISOString()}] Sending prompt to AI model...`);
    // console.log("--- PROMPT START ---"); // Uncomment for detailed debugging
    // console.log(prompt);
    // console.log("--- PROMPT END ---");

    // 4. Call the Google AI API within a try...catch block
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Check for safety blocks or lack of content
        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
             console.warn("⚠️ AI response was blocked or empty. Finish Reason:", response?.candidates?.[0]?.finishReason);
             let blockReason = response?.candidates?.[0]?.finishReason;
             let errorMessage = 'AI failed to generate content.';
             if (blockReason === 'SAFETY') {
                 errorMessage = 'Content generation blocked due to safety settings. Please review the input code or contact support if this seems incorrect.';
             } else if (blockReason) {
                 errorMessage = `Content generation stopped unexpectedly. Reason: ${blockReason}`;
             }
             return res.status(500).json({ success: false, error: errorMessage });
        }

        const text = response.text(); // Extract the generated text

        console.log(`[${new Date().toISOString()}] ✅ AI response received successfully.`);
        // console.log("--- AI RESPONSE START ---"); // Uncomment for detailed debugging
        // console.log(text);
        // console.log("--- AI RESPONSE END ---");

        // 5. Send the successful response back to the frontend
        res.json({ success: true, tests: text });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] 🔴 Error calling Google AI API:`, error);

        // 6. Handle potential errors and send an error response
        let errorMessage = 'An unexpected error occurred while generating test cases. Please try again later.';
        // Check for specific error types if possible (structure might vary based on SDK version)
         if (error.message) {
             if (error.message.includes('API key not valid') || error.message.includes('permission denied')) {
                errorMessage = 'Authentication Error: The API Key is invalid or missing permissions. Please check your server configuration (.env file).';
            } else if (error.message.includes('quota') || error.status === 429) { // Check status code if available
                errorMessage = 'Rate Limit Exceeded: Too many requests have been made. Please wait a moment and try again.';
            } else if (error.message.includes('SAFETY')) {
                errorMessage = 'Content generation blocked due to safety settings after the fact. Please review the input code.';
            } else if (error.message.includes('fetch failed') || error.message.includes('NetworkError')) {
                 errorMessage = 'Network Error: Could not connect to the Google AI service. Check your server\'s internet connection.';
            } else {
                 // Include generic part of the message for other cases
                 errorMessage = `Failed to generate test cases: ${error.message}`;
            }
         }

        res.status(500).json({ success: false, error: errorMessage });
    }
});

// --- Catch-all route for serving index.html (optional but good practice for SPAs) ---
// If no API routes match, send the main HTML file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
    console.log(`🔗 Access the application at: http://localhost:${port}`);
    console.log("🔑 Ensure your GOOGLE_API_KEY is correctly set in the .env file.");
});