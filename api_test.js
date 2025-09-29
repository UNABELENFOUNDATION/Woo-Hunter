import { GoogleGenAI } from "@google/genai";

// Test if API key is available
const testApiKey = () => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('🔑 API Key available:', apiKey ? 'YES' : 'NO');
        console.log('🔑 API Key value:', apiKey ? apiKey.substring(0, 20) + '...' : 'undefined');

        if (!apiKey) {
            console.error('❌ Gemini API key is missing!');
            console.error('💡 Make sure VITE_GEMINI_API_KEY is set in .env.local');
            return false;
        }

        // Test basic API initialization
        const ai = new GoogleGenAI({ apiKey: apiKey });
        console.log('✅ GoogleGenAI initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ API Key test failed:', error);
        return false;
    }
};

// Export for use in components
export { testApiKey };