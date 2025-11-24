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
