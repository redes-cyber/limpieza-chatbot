import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

const DEFAULT_CONFIG = {
  systemPrompt: "Eres el asistente inteligente de Limpieza Balear. Tu tono es profesional, amable y eficiente. Ayudas a los clientes de Mallorca a pedir presupuestos de limpieza y resolver dudas sobre servicios de fin de obra y oficinas.",
  META_ACCESS_TOKEN: "",
  PHONE_NUMBER_ID: "",
  VERIFY_TOKEN: "mi_token_secreto",
  GEMINI_API_KEY: "",
  ADMIN_PASSWORD: "admin"
};

let inMemoryConfig = null;

export function loadConfig() {
  if (inMemoryConfig) return inMemoryConfig;
  
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      inMemoryConfig = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      return inMemoryConfig;
    }
  } catch (err) {
      // Ignorar lectura
  }
  
  inMemoryConfig = { ...DEFAULT_CONFIG };
  try {
     fs.writeFileSync(CONFIG_FILE, JSON.stringify(inMemoryConfig, null, 2));
  } catch (e) {
     // Ignorar error de escritura en Vercel (read-only)
  }
  return inMemoryConfig;
}

export function saveConfig(newConfig) {
  const current = loadConfig();
  const updated = { ...current, ...newConfig };
  inMemoryConfig = updated;
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
  } catch (e) {
    // Ignorar error de escritura en Vercel (read-only)
  }
  
  return updated;
}
