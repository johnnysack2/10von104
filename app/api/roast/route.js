import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const prompt = `You are a brutal, cynical, but hilarious roast master. You are analyzing a user's Tinder profile or Instagram feed.
Your goal is to destroy their ego but also give them helpful advice.

Output a JSON object with the following keys:
- rating: A number from 1 to 10 (be harsh).
- roast: A short, biting paragraph roasting the user based on the image. Make it personal and specific to what you see.
- tips: An array of 3 specific, actionable tips to improve their profile/feed.

Do not hold back. Be "mean" but funny.
Return ONLY the JSON.`;

        // Call Puter.js API directly from server
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
                                { type: 'image_url', image_url: { url: image } }
                            ]
                        }
                    ],
                    model: 'gemini-2.0-flash'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Puter API error: ${response.statusText}`);
        }

        const result = await response.json();
        const responseText = result.message?.content || '';

        console.log("Raw Puter response:", responseText);

        // Clean up markdown code blocks if present
        let jsonString = responseText.replace(/```json\n?|```/g, "").trim();

        // Attempt to find the first '{' and last '}' to extract JSON
        const firstOpen = jsonString.indexOf('{');
        const lastClose = jsonString.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            jsonString = jsonString.substring(firstOpen, lastClose + 1);
        }

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Failed JSON string:", jsonString);
            return NextResponse.json({ error: 'Failed to parse AI response', details: responseText }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error roasting image:', error);
        return NextResponse.json({
            error: 'Failed to roast image',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
