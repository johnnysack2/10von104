import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are a brutal, cynical, but hilarious roast master. You are analyzing a user's Tinder profile or Instagram feed.
Your goal is to destroy their ego but also give them helpful advice.

Output a JSON object with the following keys:
- rating: A number from 1 to 10 (be harsh).
- roast: A short, biting paragraph roasting the user based on the image. Make it personal and specific to what you see.
- tips: An array of 3 specific, actionable tips to improve their profile/feed.

Do not hold back. Be "mean" but funny.
Return ONLY the JSON.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        const responseText = response.choices[0].message.content;
        console.log("Raw OpenAI response:", responseText);

        let jsonString = responseText.replace(/```json\n?|```/g, "").trim();

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
