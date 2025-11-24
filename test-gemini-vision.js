const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyAGTZG3L1raXa6mCTfukCGiOvrqZWsJBCk";
const genAI = new GoogleGenerativeAI(apiKey);

async function testVision() {
    console.log("Testing Gemini 2.0 Flash Vision...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 1x1 pixel transparent GIF base64
        const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        const prompt = "Describe this image in one word.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/gif"
                }
            }
        ]);

        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testVision();
