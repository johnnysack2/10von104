// Test Puter.js API directly
const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const prompt = `You are a roast master. Rate this image 1-10 and give a short roast. Return JSON with keys: rating, roast, tips (array of 3 strings).`;

async function testPuter() {
    try {
        const response = await fetch('https://api.puter.com/drivers/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                interface: 'puter-chat-completion',
                driver: 'gemini',
                method: 'complete',
                args: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: testImage } }
                            ]
                        }
                    ],
                    model: 'gemini-2.0-flash'
                }
            })
        });

        console.log('Status:', response.status);
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testPuter();
