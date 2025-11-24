'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Check if user has paid (simple URL param check for prototype)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('paid') === 'true' || params.get('admin') === 'true') {
                setIsPaid(true);
                setShowPaywall(true); // Auto-show if paid
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
            setShowPaywall(false);
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
            setShowPaywall(false);
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
        setShowPaywall(false);

        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            setLoadingMsg(loadingMessages[msgIndex]);
        }, 1000);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result;

                // Create a promise for the minimum delay (6 seconds)
                const delayPromise = new Promise(resolve => setTimeout(resolve, 6000));

                // Add a timeout to the fetch (e.g., 50 seconds)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 50000);

                const fetchPromise = fetch('/api/roast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: base64Image }),
                    signal: controller.signal
                });

                let response, data;
                try {
                    const [_, fetchRes] = await Promise.all([delayPromise, fetchPromise]);
                    response = fetchRes;
                    clearTimeout(timeoutId);

                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        data = await response.json();
                    } else {
                        const text = await response.text();
                        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    clearInterval(msgInterval);
                    console.error("Fetch/Parse Error:", error);
                    setError(error.name === 'AbortError' ? 'Request timed out. Please try again.' : `Connection failed: ${error.message}`);
                    setLoading(false);
                    return;
                }

                clearInterval(msgInterval);

                if (response.ok) {
                    setResult(data);
                } else {
                    console.error("API Error Details:", data);
                    const errorMsg = data.details
                        ? `${data.error}: ${data.details} (Key: ${data.envCheck?.GEMINI_API_KEY || 'Unknown'})`
                        : (data.error || 'Something went wrong');
                    setError(errorMsg);
                }
                setLoading(false);
            };
            reader.onerror = () => {
                clearInterval(msgInterval);
                setError('Failed to read file');
                setLoading(false);
            };
        } catch (err) {
            clearInterval(msgInterval);
            setError('Failed to connect to server');
            setLoading(false);
        }
    };

    const handleUnlock = () => {
        window.location.href = 'https://buy.stripe.com/5kQ7sL3PU9vF7WOfRM2go00';
    };

    return (
        <main className="container" style={{ padding: result ? '1rem' : '2rem' }}>
            <header style={{ textAlign: 'center', marginBottom: result ? '0.5rem' : '3rem', transition: 'all 0.5s ease' }}>
                <h1 style={{ fontSize: result ? '1.5rem' : '3rem', margin: 0 }}>EGO ROASTER</h1>
                {!result && <p>Dare to see what the AI really thinks of you?</p>}
            </header>

            <div className="card" style={{ padding: result ? '1rem' : '2rem', marginTop: result ? '0.5rem' : '2rem' }}>
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
                                maxHeight: result ? '120px' : '400px', // Aggressive shrink
                                borderRadius: '10px',
                                marginBottom: result ? '0.5rem' : '1rem',
                                border: '1px solid #333',
                                transition: 'all 0.5s ease',
                                objectFit: 'contain'
                            }}
                        />

                        {/* Hide buttons when result is shown to save space */}
                        {!result && (
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
                        )}
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
                    <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.5s ease' }}>

                        {/* FREE TEASER - Premium Glass Card */}
                        <div style={{
                            marginBottom: '1rem',
                            padding: '1rem',
                            background: 'rgba(20, 20, 20, 0.6)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '15px',
                            boxShadow: '0 0 30px rgba(255, 68, 68, 0.15)',
                            backdropFilter: 'blur(10px)',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Glow Effect Background */}
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                width: '200%',
                                height: '200%',
                                background: 'radial-gradient(circle, rgba(255,68,68,0.1) 0%, rgba(0,0,0,0) 70%)',
                                pointerEvents: 'none'
                            }} />

                            <h3 style={{
                                color: '#ff4444',
                                marginBottom: '0.3rem',
                                textTransform: 'uppercase',
                                fontSize: '0.6rem',
                                letterSpacing: '2px',
                                fontWeight: 'bold',
                                animation: 'pulse 2s infinite'
                            }}>
                                ✨ AI First Impression
                            </h3>
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                fontStyle: 'italic',
                                lineHeight: '1.3',
                                color: '#fff',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                "{result.teaser_roast}"
                            </p>
                        </div>

                        {/* REVEAL BUTTON (If Paywall Hidden) */}
                        {!showPaywall && !isPaid && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    className="btn"
                                    onClick={() => setShowPaywall(true)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(45deg, #ff4444, #ff0000)',
                                        boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)'
                                    }}
                                >
                                    💀 REVEAL FULL ROAST
                                </button>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                    Warning: Contains brutal honesty.
                                </p>
                            </div>
                        )}

                        {/* LOCKED CONTENT CONTAINER */}
                        {(showPaywall || isPaid) && (
                            <div style={{ position: 'relative', animation: 'fadeIn 0.5s ease' }}>

                                {/* Paywall Overlay */}
                                {!isPaid && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        left: '-10px',
                                        right: '-10px',
                                        bottom: '-10px',
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 10%, #000 100%)',
                                        backdropFilter: 'blur(10px)',
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // ALIGN TO TOP
                                        paddingTop: '2rem', // Push down slightly from top edge
                                        borderRadius: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', textShadow: '0 0 30px rgba(255,0,0,0.6)', color: '#fff' }}>
                                            ✨ ANALYSIS READY
                                        </h2>
                                        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' }}>
                                            Your full report is generated.
                                        </p>

                                        <div style={{ textAlign: 'left', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', width: '90%', maxWidth: '300px' }}>
                                            <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                ✅ <span style={{ color: '#fff' }}><strong>Unhinged Roast</strong> (Full)</span>
                                            </p>
                                            <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                ✅ <span style={{ color: '#fff' }}><strong>Brutal Rating</strong> (1-10)</span>
                                            </p>
                                            <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                ✅ <span style={{ color: '#fff' }}><strong>3 Life-Changing Tips</strong></span>
                                            </p>
                                            <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                🔥 <span style={{ color: '#fff' }}><strong>Psychological Analysis</strong></span>
                                            </p>
                                        </div>

                                        <button className="btn" onClick={handleUnlock} style={{ transform: 'scale(1.05)', marginBottom: '0.5rem', boxShadow: '0 0 30px rgba(255, 68, 68, 0.4)', padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}>
                                            UNLOCK NOW • 2.99€
                                        </button>

                                        <p style={{ fontSize: '0.6rem', color: '#555', marginTop: '0.3rem' }}>
                                            🔒 Secure Payment via Stripe
                                        </p>
                                    </div>
                                )}

                                {/* Blurred Content (Visible underneath) */}
                                <div style={{ filter: !isPaid ? 'blur(15px)' : 'none', opacity: !isPaid ? 0.5 : 1, transition: 'all 0.5s ease' }}>
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
