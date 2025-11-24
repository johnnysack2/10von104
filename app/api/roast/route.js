import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
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
            model: "llama-3.2-11b-vision-preview",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;
        console.log("Raw Groq response:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Failed JSON string:", responseText);
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
