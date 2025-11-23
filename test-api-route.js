const fs = require('fs');
const path = require('path');

async function testApi() {
    try {
        // Create a simple 1x1 pixel base64 image for testing
        const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        console.log("Sending request to http://localhost:3000/api/roast...");

        const response = await fetch('http://localhost:3000/api/roast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image }),
        });

        const contentType = response.headers.get("content-type");
        console.log("Status:", response.status);
        console.log("Content-Type:", contentType);

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("Response Data:", JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log("Response Text:", text);
        }

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testApi();
