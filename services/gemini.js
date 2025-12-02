const GeminiService = {
    // Key Management
    saveFreeKey: (key) => {
        if (key && key.trim().length > 0) {
            // Basic obfuscation using Base64
            const encodedKey = btoa(key.trim());
            localStorage.setItem('gemini_apiKey', encodedKey);
            return true;
        }
        return false;
    },

    getFreeKey: () => {
        const stored = localStorage.getItem('gemini_apiKey');
        if (stored) {
            try {
                return atob(stored);
            } catch (e) {
                console.warn('Failed to decode API Key, returning raw value (legacy support)');
                return stored;
            }
        }
        return null;
    },

    removeFreeKey: () => {
        localStorage.removeItem('gemini_apiKey');
    },

    // Hybrid Message Sending Logic
    enviarMensaje: async (prompt, jsonMode = true) => {
        const isPremium = localStorage.getItem('is_premium') === 'true';
        const freeKey = GeminiService.getFreeKey();

        if (isPremium) {
            console.log('Using Premium Tier (Backend)');
            return await GeminiService._callBackendAPI(prompt, jsonMode);
        } else {
            if (freeKey) {
                console.log('Using Free Tier (User Key)');
                return await GeminiService._callDirectAPI(freeKey, prompt, jsonMode);
            } else {
                throw new Error('API Key Required. Please add your key in Settings or Upgrade to Premium.');
            }
        }
    },

    // Private: Call Google API directly (Client-side)
    _callDirectAPI: async (apiKey, prompt, jsonMode) => {
        try {
            // Updated to Gemini 2.5 Flash as requested
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            let finalPrompt = prompt;
            if (jsonMode) {
                finalPrompt += "\n\nIMPORTANT: Output ONLY valid JSON without markdown formatting like ```json ... ```. Just the raw JSON object.";
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: finalPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Direct API Error');
            }

            const data = await response.json();
            return data; // Return full response structure to match backend
        } catch (error) {
            console.error('Direct API Error:', error);
            throw error;
        }
    },

    // Private: Call Backend API (Server-side)
    _callBackendAPI: async (prompt, jsonMode) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    jsonMode: jsonMode
                })
            });

            if (!response.ok) {
                const err = await response.json();
                // If 401/403/500, throw specific error to prompt user
                throw new Error(err.error?.message || 'Premium Service Unavailable. Please add your own API Key.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Backend API Error:', error);
            throw error;
        }
    }
};

// Expose to window for global access if needed, or just use the const
window.GeminiService = GeminiService;
