const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyAGTZG3L1raXa6mCTfukCGiOvrqZWsJBCk";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // There isn't a direct listModels method on genAI instance in some versions, 
        // but let's try to infer or just test a few common ones if list isn't easily available via SDK.
        // Actually, the SDK doesn't expose listModels directly in the main entry point easily in all versions.
        // Let's use REST API for listing to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error listing models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
