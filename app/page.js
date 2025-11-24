
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
                        </div >
                    </div >
                )
}
            </div >
        </main >
    );
}
