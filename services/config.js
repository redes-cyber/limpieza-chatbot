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

export function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (err) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(newConfig) {
  const current = loadConfig();
  const updated = { ...current, ...newConfig };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
  return updated;
}
