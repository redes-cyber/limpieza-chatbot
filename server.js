import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadConfig, saveConfig } from './services/config.js';
import { getHistory, addMessage } from './services/memory.js';
import { generateResponse } from './services/gemini.js';
import { sendWhatsAppMessage } from './services/whatsapp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Almacenar logs en memoria para el dashboard (últimos 100)
const messageLogs = [];

function addLog(type, phone, content) {
    const log = { id: Date.now(), timestamp: new Date().toISOString(), type, phone, content };
    messageLogs.unshift(log);
    if (messageLogs.length > 100) messageLogs.pop();
    io.emit('new_log', log);
}

// ==== RUTAS DEL DASHBOARD ADMIN ====

app.get('/api/admin/config', (req, res) => {
    const config = loadConfig();
    const { ADMIN_PASSWORD, ...safeConfig } = config; // No enviar la contraseña al frontend
    res.json(safeConfig);
});

app.post('/api/admin/config', (req, res) => {
    saveConfig(req.body);
    addLog('system', 'System', 'Configuración actualizada');
    res.json({ success: true });
});

app.get('/api/admin/logs', (req, res) => {
    res.json(messageLogs);
});

// Servir la interfaz del admin (React/HTML puro)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ==== RUTAS DEL WEBHOOK (META) ====

// Verificación del Webhook
app.get('/webhook', (req, res) => {
    const config = loadConfig();
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
            console.log("WEBHOOK VERIFICADO EXITOSAMENTE");
            addLog('system', 'System', 'Webhook verificado correctamente por Meta');
            res.status(200).send(challenge);
        } else {
            console.log("TOKEN INCORRECTO EN VERIFICACIÓN");
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Recepción de mensajes
app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            const message = body.entry[0].changes[0].value.messages[0];
            const senderPhone = message.from;

            if (message.type === "text") {
                const messageText = message.text.body;

                // 1. Registrar mensaje entrante
                addLog('incoming', senderPhone, messageText);

                // 2. Procesar con Gemini y responder (No bloqueamos la respuesta HTTP a Meta)
                (async () => {
                   try {
                       const history = getHistory(senderPhone);
                       
                       // Consultar IA
                       const responseText = await generateResponse(history, messageText);
   
                       // Guardar en memoria (usuario y modelo)
                       addMessage(senderPhone, "user", messageText);
                       addMessage(senderPhone, "model", responseText);
   
                       // Enviar respuesta por WhatsApp
                       await sendWhatsAppMessage(senderPhone, responseText);
   
                       // Registrar respuesta saliente
                       addLog('outgoing', senderPhone, responseText);
                   } catch (error) {
                       console.error("Error al procesar el mensaje:", error);
                       addLog('error', senderPhone, `Error: ${error.message}`);
                   }
                })();
            } else {
               addLog('system', senderPhone, `(Mensaje recibido no de texto: ${message.type})`);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// ==== INICIAR SERVIDOR ====
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Servidor iniciado en puerto ${PORT}`);
        addLog('system', 'System', `Servidor iniciado en puerto ${PORT}`);
    });
}

export default app;
