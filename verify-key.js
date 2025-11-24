const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyAGTZG3L1raXa6mCTfukCGiOvrqZWsJBCk";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Explain how AI works in a few words");
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
