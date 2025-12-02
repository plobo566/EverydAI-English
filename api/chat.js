const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY_PREMIUM;

        if (!apiKey) {
            console.error('Server Error: GEMINI_API_KEY_PREMIUM not configured');
            return res.status(500).json({
                error: {
                    message: 'Server configuration error. Please contact support.'
                }
            });
        }

        const { prompt, jsonMode } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: { message: 'Prompt is required' } });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let finalPrompt = prompt;
        if (jsonMode) {
            finalPrompt += "\n\nIMPORTANT: Output ONLY valid JSON without markdown formatting like ```json ... ```. Just the raw JSON object.";
        }

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        // If JSON mode was requested, try to parse it to ensure validity, 
        // but return the text/object as appropriate or just the text for the frontend to handle
        // For consistency with the frontend logic, we'll return the text and let frontend parse if needed,
        // OR we can parse it here. The previous frontend logic parsed it.
        // Let's return the raw text to match the 'generateContent' SDK behavior which returns a response object.
        // We will return a JSON object with the text.

        return res.status(200).json({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: text }
                        ]
                    }
                }
            ]
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error'
            }
        });
    }
};
