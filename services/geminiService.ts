
import { GoogleGenAI, Type, Modality } from "@google/genai";

// This file centralizes Gemini API interactions.
// Note: In a real-world app, you'd handle the API key more securely.
// Here, we assume process.env.API_KEY is available in the execution environment.

const getApiKey = () => {
    const key = process.env.API_KEY;
    if (!key) {
        // In a real app, you might have a more sophisticated fallback or error handling.
        // For this showcase, we'll alert the user.
        // The Veo component will handle its own API key selection flow.
        console.error("API_KEY environment variable not set!");
    }
    return key;
};

// General purpose client
export const getGeminiAI = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

// Veo requires creating a new client right before the call to get the latest key
export const getVeoGeminiAI = () => {
    const apiKey = getApiKey();
     if (!apiKey) {
        throw new Error("API Key for Veo not found. Please select a key.");
    }
    return new GoogleGenAI({ apiKey });
}

// Helper to convert file to base64 for API calls
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:mime/type;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export { Type, Modality };
