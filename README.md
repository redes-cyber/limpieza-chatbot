# 🤖 Limpieza Balear - WhatsApp AI Bot

Aplicación Node.js que conecta la **API Oficial de Meta (WhatsApp Business)** directamente con la **API de Google Gemini**, diseñada específicamente para la atención temprana de clientes de Limpieza Balear.

## 🚀 Características
- Gestión integral y directa: Sin n8n, Zapier ni terceros.
- Memoria de Historial Inteligente: Gemini recuerda el contexto de conversaciones largas.
- Dashboard Administrativo en Vivo (Conexiones WebSockets con UI de Tailwind).
- Ajustes de IA 'en caliente': Cambia el prompt sin reiniciar el bot.

## 🛠 Instalación Local

1. Instala las dependencias en este directorio:
   ```bash
   npm install
   ```
2. Inicia el servidor (en puerto 3000 por defecto):
   ```bash
   npm start
   ```
3. Exponer el servidor al mundo usando ngrok (necesario para el webhook de Meta si corres en local):
   ```bash
   ngrok http 3000
   ```

## ⚙️ Configuración (Configurar en el Dashboard directamente)

1. Abre: **http://localhost:3000/admin**
2. Introduce la contraseña por defecto: `admin` (la puedes cambiar luego en el archivo `config.json` que se generará automáticamente en local).
3. Configura:
   - **System Prompt**: Ya viene con un pre-escrito ajustado para Limpieza Balear, pero lo puedes cambiar.
   - **API Key Gemini**: Obtenla en `aistudio.google.com`.
   - **Meta Access Token**: Desde tu panel de Meta for Developers (Token permanente generable, o prueba 24h).
   - **Phone Number ID**: El ID numérico de tu teléfono registrado en Meta.
   - **Verify Token**: El token secreto que usarás para validar el Webhook en el panel de Meta. Introduce uno al azar o usa `mi_token_secreto`.

## 🌐 Configurar Meta for Developers (El Webhook)
1. En el panel de WhatsApp de Meta, navega a Configuración > Webhooks.
2. Añade un endpoint de recepción (Por ejemplo tu URL de Ngrok o Dominio de producción: `https://tu-dominio.com/webhook`).
3. Introduce como token de verificación el mismo `Verify Token` que pusiste en el Admin del Dashboard. (EJ: `mi_token_secreto`).
4. Selecciona la opción de suscribirte al campo: **`messages`**.
5. ¡Listo! Todo mensaje llegará al servidor.

## 📦 Despliegue en Producción (Render, Railway o VPS)
Este script es 100% compatible con Render.com, Railway o cualquier VPS.

Solo necesitas:
1. Subir el código a GitHub.
2. Conectar tu repositorio en Render/Railway como "Web Service".
3. Variables de Entorno no necesarias para arranque, se almacenan directamente usando la consola Admin y el archivo local (En caso de plataformas de estado efímero como Heroku es recomendado pasar a usar una DB SQL real para el `config.json` y `chats.json` usando Supabase).

¡Éxito con Limpieza Balear!
