import fs from 'fs';
import path from 'path';

const CHATS_FILE = path.join(process.cwd(), 'chats.json');

export function loadChats() {
  if (!fs.existsSync(CHATS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

export function saveChats(chats) {
  fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2));
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
