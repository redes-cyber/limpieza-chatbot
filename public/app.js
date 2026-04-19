// La lógica de la app del cliente (Dashboard Admin)
const dashboardScreen = document.getElementById('dashboardScreen');

// Campos de configuración
const promptInput = document.getElementById('promptInput');
const geminiKey = document.getElementById('geminiKey');
const metaToken = document.getElementById('metaToken');
const phoneId = document.getElementById('phoneId');
const verifyToken = document.getElementById('verifyToken');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const saveStatus = document.getElementById('saveStatus');

const logsContainer = document.getElementById('logsContainer');

let socket = null;

// Inicialización
showDashboard();

saveConfigBtn.addEventListener('click', saveConfig);

async function showDashboard() {
    await loadConfig();
    await loadInitialLogs();

    if (!socket) {
        socket = io();
        socket.on('new_log', (log) => {
            renderLog(log, true);
        });
        socket.on('disconnect', () => {
             updateStatus(false);
        });
        socket.on('connect', () => {
             updateStatus(true);
        });
    }
}

function updateStatus(isOnline) {
    const dot = document.getElementById('statusDot');
    const ping = document.getElementById('statusPing');
    const text = document.getElementById('statusText');
    if(isOnline) {
        dot.classList.replace('bg-red-500', 'bg-[#0ea5e9]');
        ping.classList.replace('bg-red-400', 'bg-sky-400');
        ping.classList.remove('hidden');
        text.textContent = 'Online';
        text.classList.replace('text-red-500', 'text-[#0ea5e9]');
    } else {
        dot.classList.replace('bg-[#0ea5e9]', 'bg-red-500');
        ping.classList.add('hidden');
        text.textContent = 'Offline';
        text.classList.replace('text-[#0ea5e9]', 'text-red-500');
    }
}

async function loadConfig() {
    try {
        const res = await fetch('/api/admin/config');
        const config = await res.json();
        
        promptInput.value = config.systemPrompt || '';
        geminiKey.value = config.GEMINI_API_KEY || '';
        metaToken.value = config.META_ACCESS_TOKEN || '';
        phoneId.value = config.PHONE_NUMBER_ID || '';
        verifyToken.value = config.VERIFY_TOKEN || '';
    } catch (err) {
        console.error("Error cargando configuración", err);
    }
}

async function saveConfig() {
    saveConfigBtn.disabled = true;
    saveConfigBtn.innerHTML = "Guardando...";
    
    const newConfig = {
        systemPrompt: promptInput.value,
        GEMINI_API_KEY: geminiKey.value,
        META_ACCESS_TOKEN: metaToken.value,
        PHONE_NUMBER_ID: phoneId.value,
        VERIFY_TOKEN: verifyToken.value
    };

    try {
        const res = await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newConfig)
        });
        
        saveStatus.classList.remove('opacity-0');
        setTimeout(() => saveStatus.classList.add('opacity-0'), 2000);
    } catch (err) {
        alert("Error al guardar la configuración");
    } finally {
        saveConfigBtn.disabled = false;
        saveConfigBtn.innerHTML = "Guardar Configuración";
    }
}

async function loadInitialLogs() {
    logsContainer.innerHTML = '';
    try {
        const res = await fetch('/api/admin/logs');
        const logs = await res.json();
        
        logs.reverse().forEach(log => renderLog(log, false));
        scrollToBottom();
    } catch (err) {
        console.error("Error cargando logs", err);
    }
}

function renderLog(log, autoScroll) {
    const isScrolledToBottom = logsContainer.scrollHeight - logsContainer.clientHeight <= logsContainer.scrollTop + 10;
    
    const div = document.createElement('div');
    div.className = "flex flex-col gap-1 p-3 rounded-md bg-white border border-gray-100 shadow-sm text-sm";
    
    let headerColor = "text-gray-500";
    let typeLabel = "Sistema";
    let contentClass = "text-gray-700";

    if (log.type === 'incoming') {
        headerColor = "text-green-600";
        typeLabel = "📥 Recibido";
        div.classList.add('border-l-4', 'border-l-green-500');
    } else if (log.type === 'outgoing') {
        headerColor = "text-[#0ea5e9]";
        typeLabel = "📤 Enviado";
        div.classList.add('border-l-4', 'border-l-[#0ea5e9]');
    } else if (log.type === 'error') {
        headerColor = "text-red-500";
        typeLabel = "❌ Error";
        div.classList.add('border-l-4', 'border-l-red-500');
        contentClass = "text-red-600 font-mono text-xs";
    }

    const time = new Date(log.timestamp).toLocaleTimeString();

    div.innerHTML = `
        <div class="flex justify-between items-center bg-">
            <span class="font-bold ${headerColor}">${typeLabel} - ${log.phone}</span>
            <span class="text-xs text-gray-400 font-mono">${time}</span>
        </div>
        <div class="mt-1 whitespace-pre-wrap ${contentClass}">${escapeHtml(log.content)}</div>
    `;

    logsContainer.appendChild(div);

    if (autoScroll && isScrolledToBottom) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
