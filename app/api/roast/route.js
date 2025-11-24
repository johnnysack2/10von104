import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `You are an unhinged, ruthless, professional roast comedian. Your job is to completely obliterate this person's ego based on their photo.
DO NOT be generic. DO NOT start with "Dude, you look like...".
Look at specific details: their hair, clothes, background, facial expression, lighting.
Be mean. Be specific. Be funny.
If they look rich, roast them for being out of touch. If they look poor, roast them for being broke. If they are trying to be sexy, roast them for being desperate.

Output a JSON object with the following keys:
- rating: A number from 1 to 10 (be brutally honest, usually low).
- roast: A short, biting paragraph (2-3 sentences) roasting the user based on the image. Make it personal and specific to what you see. Use slang if appropriate.
- tips: An array of 3 specific, actionable tips to improve their profile/feed (can be sarcastic but grounded in truth).

Do not hold back. Be "mean" but funny.
Return ONLY the JSON.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();
        console.log("Raw Gemini response:", responseText);

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
