import { loadConfig } from './config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateResponse(history, userMessage) {
    const config = loadConfig();
    if (!config.GEMINI_API_KEY) {
        throw new Error("La API Key de Gemini no está configurada.");
    }

    const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: config.systemPrompt 
    });

    // Iniciar chat con historial preexistente (sin el mensaje actual)
    const chat = model.startChat({
        history: history
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
}
