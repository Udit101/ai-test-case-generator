// public/script.js
const codeInput = document.getElementById('codeInput');
const languageInput = document.getElementById('languageInput');
const generateButton = document.getElementById('generateButton');
const outputElement = document.getElementById('output');
const statusElement = document.getElementById('status');

generateButton.addEventListener('click', handleGenerateClick);

async function handleGenerateClick() {
    const userCode = codeInput.value.trim();
    const language = languageInput.value.trim();

    if (!userCode) {
        showStatus('Please enter some code first.', 'error');
        outputElement.textContent = 'Waiting for input...';
        return;
    }

    // --- UI Updates: Indicate loading ---
    showStatus('Generating test cases... Please wait.', 'loading');
    generateButton.disabled = true;
    outputElement.textContent = 'Processing...'; // Clear previous output

    try {
        // --- Make API Call to Backend ---
        const response = await fetch('/generate-tests', { // URL matches backend endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: userCode, language: language }), // Send code and language
        });

        const data = await response.json(); // Always parse JSON first

        // --- Handle Response ---
        if (response.ok && data.success) {
            // Success
            outputElement.textContent = data.tests; // Display generated tests
            showStatus('Test cases generated successfully!', 'success');
        } else {
            // Handle errors from backend (e.g., validation, AI API errors)
            const errorMessage = data.error || `HTTP error! Status: ${response.status}`;
            outputElement.textContent = 'Generation failed.';
            showStatus(`Error: ${errorMessage}`, 'error');
            console.error('Backend error:', data.error || `HTTP Status ${response.status}`);
        }

    } catch (error) {
        // Handle network errors or issues with fetch itself
        console.error('Frontend Fetch Error:', error);
        outputElement.textContent = 'Generation failed.';
        showStatus('Network error or server issue. Please check console or try again.', 'error');
    } finally {
        // --- UI Updates: Re-enable button ---
        generateButton.disabled = false;
        // Optionally clear loading status after a delay if it wasn't replaced by success/error
         if (statusElement.classList.contains('status-loading')) {
             // Don't immediately clear success/error messages
             setTimeout(() => {
                if (!statusElement.classList.contains('status-error') && !statusElement.classList.contains('status-success')) {
                   hideStatus(); // Hide only if it's still the loading message
                }
             }, 3000); // Keep loading message for a bit if nothing else replaced it
         }
    }
}

// --- Helper function for status messages ---
function showStatus(message, type = 'loading') { // types: loading, error, success
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`; // Reset classes and add current type
    statusElement.style.display = 'block';
}

function hideStatus() {
     statusElement.style.display = 'none';
     statusElement.textContent = '';
     statusElement.className = 'status-message';
}

// Initial setup
hideStatus(); // Ensure status is hidden initially