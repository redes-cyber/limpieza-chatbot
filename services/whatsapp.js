import axios from 'axios';
import { loadConfig } from './config.js';

export async function sendWhatsAppMessage(to, text) {
    const config = loadConfig();
    const { META_ACCESS_TOKEN, PHONE_NUMBER_ID } = config;

    if (!META_ACCESS_TOKEN || !PHONE_NUMBER_ID) {
        throw new Error("Las credenciales de WhatsApp no están configuradas.");
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
            preview_url: false,
            body: text
        }
    };

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`
    };

    const response = await axios.post(url, data, { headers });
    return response.data;
}
