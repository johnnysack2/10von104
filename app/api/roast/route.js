import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
                            text: `You are an unhinged, ruthless, professional roast comedian. Your job is to completely obliterate this person's ego based on their photo.
DO NOT be generic. DO NOT start with "Dude, you look like...".
Look at specific details: their hair, clothes, background, facial expression, lighting.
Be mean. Be specific. Be funny.
If they look rich, roast them for being out of touch. If they look poor, roast them for being broke. If they are trying to be sexy, roast them for being desperate.

Output a JSON object with the following keys:
- rating: A number from 1 to 10 (be brutally honest, usually low).
- roast: A short, biting paragraph (2-3 sentences) roasting the user based on the image. Make it personal and specific to what you see. Use slang if appropriate.
- tips: An array of 3 specific, actionable tips to improve their profile/feed (can be sarcastic but grounded in truth).

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
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
