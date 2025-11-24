'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Check if user has paid (simple URL param check for prototype)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('paid') === 'true' || params.get('admin') === 'true') {
                setIsPaid(true);
            }
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const [loadingMsg, setLoadingMsg] = useState('');

    const loadingMessages = [
        "Scanning facial symmetry...",
        "Detecting insecurities...",
        "Analyzing fashion disasters...",
        "Oh god... generating roast..."
    ];

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setLoadingMsg(loadingMessages[0]);

        // Start message cycling
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            setLoadingMsg(loadingMessages[msgIndex]);
        }, 1000);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result;

                // Create a promise for the minimum delay (6 seconds)
                const delayPromise = new Promise(resolve => setTimeout(resolve, 6000));

                const prompt = `You are a brutal, cynical, but hilarious roast master. You are analyzing a user's Tinder profile or Instagram feed.
Your goal is to destroy their ego but also give them helpful advice.

Output a JSON object with the following keys:
- rating: A number from 1 to 10 (be harsh).
- roast: A short, biting paragraph roasting the user based on the image. Make it personal and specific to what you see.
- tips: An array of 3 specific, actionable tips to improve their profile/feed.

Do not hold back. Be "mean" but funny.
Return ONLY the JSON.`;

                // Call Puter.js directly (client-side)
                const aiPromise = window.puter.ai.chat(
                    prompt,
                    base64Image,
                    { model: 'gemini-2.0-flash' }
                );

                // Wait for BOTH to finish
                const [_, responseText] = await Promise.all([delayPromise, aiPromise]);

                clearInterval(msgInterval); // Stop cycling messages

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
                    setError('Failed to parse AI response');
                    setLoading(false);
                    return;
                }

                setResult(data);
                setLoading(false);
            };
            reader.onerror = () => {
                clearInterval(msgInterval);
                setError('Failed to read file');
                setLoading(false);
            };
        } catch (err) {
            clearInterval(msgInterval);
            setError('Failed to connect to AI: ' + err.message);
            setLoading(false);
        }
    };

    const handleUnlock = () => {
        window.location.href = 'https://buy.stripe.com/5kQ7sL3PU9vF7WOfRM2go00';
    };

    return (
        <main className="container">
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1>EGO ROASTER</h1>
                <p>Dare to see what the AI really thinks of you?</p>
            </header>

            <div className="card">
                {!preview ? (
                    <div
                        className="upload-area"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                            Drop your screenshot here
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            or click to browse
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                borderRadius: '10px',
                                marginBottom: '2rem',
                                border: '1px solid #333',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Roasting...' : 'ROAST ME'}
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#333', boxShadow: 'none' }}
                                onClick={() => {
                                    setFile(null);
                                    setPreview(null);
                                    setResult(null);
                                }}
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <div className="loader"></div>
                        <p className="loading-text">
                            {loadingMsg}
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{ marginTop: '2rem', color: 'red', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s ease', position: 'relative' }}>
                        {/* Paywall Overlay */}
                        {!isPaid && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)', /* Safari/iOS support */
                                background: 'rgba(0,0,0,0.85)',
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '10px'
                            }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textShadow: '0 0 10px black' }}>
                                    TOO BRUTAL TO SHOW
                                </h2>
                                <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                                    Unlock the full roast for just 2.99€
                                </p>
                                <button className="btn" onClick={handleUnlock}>
                                    UNLOCK NOW 🔓
                                </button>
                            </div>
                        )}

                        <div className="rating-circle">
                            {result.rating}/10
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2>The Roast</h2>
                            <p style={{ fontSize: '1.1rem', color: '#fff' }}>
                                {result.roast}
                            </p>
                        </div>

                        <div>
                            <h2>Tips to Un-Cringe</h2>
                            <ul className="tips-list">
                                {result.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
