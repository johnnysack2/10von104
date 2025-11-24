async function testKey() {
    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAGTZG3L1raXa6mCTfukCGiOvrqZWsJBCk',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say hi' }] }]
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
        console.log('✅ API KEY WORKS!');
        console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
        console.log('❌ API KEY FAILED!');
        console.log('Error:', data);
    }
}

testKey();
