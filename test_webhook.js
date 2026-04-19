const payload = {
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          contacts: [{ profile: { name: "Test" }, wa_id: "34600000000" }],
          messages: [{
            id: "msg-123",
            from: "34600000000",
            type: "text",
            text: { body: "Hola" }
          }]
        }
      }]
    }]
  };

fetch('http://localhost:3000/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Network Error:', e));
