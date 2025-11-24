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
                const delayPromise = new Promise(resolve => setTimeout(resolve, 6000));
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 50000);

                const fetchPromise = fetch('/api/roast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    const errorMsg = data.details ? `${data.error}: ${data.details} (Key: ${data.envCheck?.GEMINI_API_KEY || 'Unknown'})` : (data.error || 'Something went wrong');
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
        <main className="container" style={{ padding: result ? '0.8rem' : '2rem' }}>
            <header style={{ textAlign: 'center', marginBottom: result ? '0.3rem' : '3rem', transition: 'all 0.5s ease' }}>
                <h1 style={{ fontSize: result ? '1.3rem' : '3rem', margin: 0 }}>EGO ROASTER</h1>
                {!result && <p>Dare to see what the AI really thinks of you?</p>}
            </header>

            <div className="card" style={{ padding: result ? '0.8rem' : '2rem', marginTop: result ? '0.3rem' : '2rem' }}>
                {!preview ? (
                    <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()}>
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Drop your screenshot here</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>or click to browse</p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: result ? '70px' : '400px', borderRadius: '8px', marginBottom: result ? '0.15rem' : '1rem', border: '1px solid #333', transition: 'all 0.5s ease', objectFit: 'contain' }} />
                        {!result && (
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button className="btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Roasting...' : 'ROAST ME'}</button>
                                <button className="btn" style={{ background: '#333', boxShadow: 'none' }} onClick={() => { setFile(null); setPreview(null); setResult(null); }} disabled={loading}>Reset</button>
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <div className="loader"></div>
                        <p className="loading-text">{loadingMsg}</p>
                    </div>
                )}

                {error && <div style={{ marginTop: '2rem', color: 'red', textAlign: 'center' }}>{error}</div>}

                {result && (
                    <div style={{ marginTop: '0rem', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ marginBottom: '0.15rem', padding: '0.35rem', background: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '8px', boxShadow: '0 0 15px rgba(255, 68, 68, 0.1)', backdropFilter: 'blur(10px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,68,68,0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
                            <h3 style={{ color: '#ff4444', marginBottom: '0.05rem', textTransform: 'uppercase', fontSize: '0.45rem', letterSpacing: '1px', fontWeight: 'bold', animation: 'pulse 2s infinite', position: 'relative' }}>✨ AI First Impression</h3>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.15', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', position: 'relative', margin: 0 }}>"{result.teaser_roast}"</p>
                        </div>

                        <div style={{ position: 'relative', minHeight: '300px', marginTop: '0rem' }}>
                            {!isPaid && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', textAlign: 'center', padding: '0.8rem' }}>
                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.6rem', textShadow: '0 0 30px rgba(255,0,0,0.9)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🔒 <span>LOCKED</span>
                                    </h2>

                                    <div style={{ textAlign: 'left', marginBottom: '0.7rem', background: 'rgba(0,0,0,0.8)', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(255,68,68,0.2)', width: '90%', maxWidth: '280px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                        <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#eee' }}>
                                            💀 <span style={{ color: '#fff' }}><strong>Unhinged Roast</strong></span>
                                        </p>
                                        <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#eee' }}>
                                            🔥 <span style={{ color: '#fff' }}><strong>Brutal Rating</strong> (1-10)</span>
                                        </p>
                                        <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#eee' }}>
                                            🧬 <span style={{ color: '#fff' }}><strong>Psych Analysis</strong></span>
                                        </p>
                                        <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#eee' }}>
                                            💡 <span style={{ color: '#fff' }}><strong>3 Tips</strong></span>
                                        </p>
                                    </div>

                                    <button className="btn" onClick={handleUnlock} style={{ transform: 'scale(1.05)', marginBottom: '0.4rem', boxShadow: '0 0 30px rgba(255, 68, 68, 0.5)', padding: '0.85rem 1.6rem', fontSize: '0.92rem', fontWeight: 'bold', border: '1px solid #ff4444' }}>
                                        UNLOCK NOW • 2.99€
                                    </button>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '0.15rem 0.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                                            <span style={{ color: '#fbbf24', fontSize: '0.65rem' }}>★★★★★</span>
                                            <span style={{ color: '#aaa', fontSize: '0.65rem', fontWeight: 'bold' }}>4.9/5</span>
                                        </div>
                                        <p style={{ fontSize: '0.6rem', color: '#666', margin: 0 }}>🔒 Secure Payment via Stripe</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ filter: !isPaid ? 'blur(10px)' : 'none', opacity: !isPaid ? 0.7 : 1, transition: 'all 0.5s ease', userSelect: 'none', pointerEvents: 'none' }}>
                                <div className="rating-circle">{result.rating}/10</div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h2>The Roast</h2>
                                    <p style={{ fontSize: '1.05rem', color: '#fff', lineHeight: '1.5' }}>{result.roast}</p>
                                </div>
                                <div>
                                    <h2>Tips to Un-Cringe</h2>
                                    <ul className="tips-list">
                                        {result.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
