// ====== UI LOGIC ======
const tabs = ['dashboard', 'config'];

window.switchTab = function(targetId) {
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        document.getElementById(`nav-${t}`).classList.remove('active');
    });
    document.getElementById(`tab-${targetId}`).classList.remove('hidden');
    document.getElementById(`nav-${targetId}`).classList.add('active');
};

// ====== MAIN LOGIC ======
const promptInput = document.getElementById('promptInput');
const geminiKey = document.getElementById('geminiKey');
const metaToken = document.getElementById('metaToken');
const phoneId = document.getElementById('phoneId');
const verifyToken = document.getElementById('verifyToken');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const saveStatus = document.getElementById('saveStatus');
const logsContainer = document.getElementById('logsContainer');
const interactionsCount = document.getElementById('interactionsCount');

let socket = null;
let absoluteLogCount = 0;

showDashboard();
saveConfigBtn.addEventListener('click', saveConfig);

async function showDashboard() {
    await loadConfig();
    await loadInitialLogs();

    if (!socket) {
        socket = io();
        socket.on('new_log', (log) => {
            renderLog(log, true);
            updateMetric(log);
        });
        socket.on('disconnect', () => updateStatus(false));
        socket.on('connect', () => updateStatus(true));
    }
}

function updateMetric(log) {
    if(log.type === 'incoming' || log.type === 'outgoing') {
        absoluteLogCount++;
        interactionsCount.textContent = Math.ceil(absoluteLogCount / 2).toString();
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
        text.textContent = 'Sistema Conectado';
        text.classList.replace('text-red-500', 'text-gray-700');
    } else {
        dot.classList.replace('bg-[#0ea5e9]', 'bg-red-500');
        ping.classList.add('hidden');
        text.textContent = 'Sin conexión';
        text.classList.replace('text-gray-700', 'text-red-500');
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
    saveConfigBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    
    const newConfig = {
        systemPrompt: promptInput.value,
        GEMINI_API_KEY: geminiKey.value,
        META_ACCESS_TOKEN: metaToken.value,
        PHONE_NUMBER_ID: phoneId.value,
        VERIFY_TOKEN: verifyToken.value
    };

    try {
        await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });
        
        saveStatus.classList.remove('opacity-0');
        setTimeout(() => saveStatus.classList.add('opacity-0'), 2500);
    } catch (err) {
        alert("Error al guardar la configuración");
    } finally {
        saveConfigBtn.disabled = false;
        saveConfigBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios en vivo';
    }
}

async function loadInitialLogs() {
    logsContainer.innerHTML = '';
    absoluteLogCount = 0;
    try {
        const res = await fetch('/api/admin/logs');
        const logs = await res.json();
        
        logs.reverse().forEach(log => {
            renderLog(log, false);
            updateMetric(log);
        });
        scrollToBottom();
    } catch (err) {
        console.error("Error cargando logs", err);
    }
}

function renderLog(log, autoScroll) {
    const isScrolledToBottom = logsContainer.scrollHeight - logsContainer.clientHeight <= logsContainer.scrollTop + 20;
    
    const div = document.createElement('div');
    div.className = "flex flex-col p-4 rounded-xl shadow-sm border bg-white relative animate-fade-in-up transition";
    
    let headerColor = "text-gray-500";
    let icon = '<i class="fa-solid fa-gear"></i>';
    let typeLabel = "Sistema";
    let contentClass = "text-gray-700";

    if (log.type === 'incoming') {
        headerColor = "text-green-600";
        icon = '<i class="fa-brands fa-whatsapp text-lg"></i>';
        typeLabel = "Mensaje Recibido";
        div.classList.add('border-green-200');
    } else if (log.type === 'outgoing') {
        headerColor = "text-sky-600";
        icon = '<i class="fa-solid fa-robot text-lg"></i>';
        typeLabel = "Respuesta Gemini";
        div.classList.add('border-sky-200');
    } else if (log.type === 'error') {
        headerColor = "text-red-600";
        icon = '<i class="fa-solid fa-triangle-exclamation text-lg"></i>';
        typeLabel = "Error del Sistema";
        div.classList.add('border-red-200', 'bg-red-50/50');
        contentClass = "text-red-700 font-mono text-xs overflow-x-auto p-2 bg-red-100/50 rounded mt-1";
    }

    const time = new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

    div.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <span class="font-bold flex items-center gap-2 ${headerColor}">
                ${icon} <span class="tracking-wide">${typeLabel}</span> <span class="text-xs ml-2 py-0.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600 font-mono">${log.phone}</span>
            </span>
            <span class="text-xs text-gray-400 font-mono px-2 py-1 bg-slate-100 rounded border border-slate-200 shadow-inner">${time}</span>
        </div>
        <div class="whitespace-pre-wrap leading-relaxed border-l-2 ml-2 pl-3 pb-1 border-gray-100 ${contentClass}">${escapeHtml(log.content)}</div>
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
