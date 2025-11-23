const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyDQG1hOAk1R9saonWe4SmY5becR62-Jr1s";
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = "Hello, are you working?";

        console.log("Testing gemini-2.0-flash...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Error testing Gemini:", error);
    }
}

run();
