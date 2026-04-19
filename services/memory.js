import fs from 'fs';
import path from 'path';

const CHATS_FILE = path.join(process.cwd(), 'chats.json');

let inMemoryChats = null;

export function loadChats() {
  if (inMemoryChats) return inMemoryChats;
  
  try {
    if (fs.existsSync(CHATS_FILE)) {
      inMemoryChats = JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8'));
      return inMemoryChats;
    }
  } catch (err) {
    // 
  }
  
  inMemoryChats = {};
  return inMemoryChats;
}

export function saveChats(chats) {
  inMemoryChats = chats;
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2));
  } catch(e) {
    // Ignorar error de escritura en Vercel (read-only)
  }
}

export function getHistory(phoneNumber) {
  const chats = loadChats();
  return chats[phoneNumber] || [];
}

export function addMessage(phoneNumber, role, text) {
  const chats = loadChats();
  if (!chats[phoneNumber]) {
    chats[phoneNumber] = [];
  }
  
  chats[phoneNumber].push({ role, parts: [{ text }] });
  
  // Guardar solo los últimos 10 mensajes (5 intercambios) para ahorrar memoria
  if (chats[phoneNumber].length > 10) {
    chats[phoneNumber] = chats[phoneNumber].slice(-10);
  }
  
  saveChats(chats);
}
