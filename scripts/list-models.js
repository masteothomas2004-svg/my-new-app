const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
    try {
        // There isn't a direct listModels on the instance in some versions, 
        // but let's try to just generate content with a known fallback if getting list is hard.
        // Actually, the error message said "Call ListModels". 
        // The node SDK might expose it via a ModelService or similar?
        // In @google/generative-ai, it is often not directly exposed in the high-level client for listing.
        // But let's try to just test a few models.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        console.log("Testing model availability...");

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                console.log(`✅ Model '${modelName}' is WORKING.`);
            } catch (error) {
                console.log(`❌ Model '${modelName}' failed: ${error.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
