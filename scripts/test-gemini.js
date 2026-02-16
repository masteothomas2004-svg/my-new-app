const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'gemini-test.log');

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function main() {
    const apiKey = process.env.GOOGLE_API_KEY;
    log("Checking API Key: " + (apiKey ? "Present (starts with " + apiKey.substring(0, 5) + "...)" : "Missing"));

    if (!apiKey) {
        log("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

    for (const modelName of modelsToTry) {
        try {
            log(`\nTesting model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello?");
            log(`✅ Success with ${modelName}! Response: ${result.response.text()}`);
            return; // Exit on first success
        } catch (error) {
            log(`❌ Failed with ${modelName}: ${error.message}`);
            if (error.status === 400) {
                log("   -> Potential Issue: API Key Invalid or Project not enabled.");
            }
        }
    }

    // If we reach here, all model attempts failed.
    // Try to list models using the REST API directly to see what's valid
    try {
        log("\nAttempting to list models via REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            log("✅ Available Models:");
            data.models.forEach(m => log(` - ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            log("❌ Could not list models. Response: " + JSON.stringify(data, null, 2));
        }
    } catch (e) {
        log("❌ REST API List Models failed: " + e.message);
    }
}

main();
