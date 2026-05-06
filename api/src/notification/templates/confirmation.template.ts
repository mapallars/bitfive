export interface ConfirmationTemplateData {
  userName: string
  eventName: string
  eventDate: string
  eventLocation: string
  qrImageBase64: string
}

export function confirmationTemplate(data: ConfirmationTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Inscripción</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a1a2e; color: #fff; padding: 30px 40px; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 40px; color: #333; }
    .event-details { background: #f9f9f9; border-left: 4px solid #e94560; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .event-details p { margin: 6px 0; font-size: 14px; }
    .event-details strong { color: #1a1a2e; }
    .qr-section { text-align: center; margin: 30px 0; }
    .qr-section p { color: #666; font-size: 13px; }
    .qr-section img { border: 2px solid #e0e0e0; border-radius: 8px; padding: 10px; }
    .footer { background: #f4f4f4; text-align: center; padding: 16px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Inscripción Confirmada!</h1>
    </div>
    <div class="body">
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>Tu inscripción al siguiente evento ha sido registrada exitosamente.</p>
      <div class="event-details">
        <p><strong>Evento:</strong> ${data.eventName}</p>
        <p><strong>Fecha:</strong> ${data.eventDate}</p>
        <p><strong>Lugar:</strong> ${data.eventLocation}</p>
      </div>
      <div class="qr-section">
        <p>Presenta este código QR el día del evento para registrar tu asistencia.</p>
        <img src="${data.qrImageBase64}" alt="Código QR de asistencia" width="200" height="200" />
        <p><em>No compartas este código con otras personas.</em></p>
      </div>
      <p>¡Nos vemos en el evento!</p>
    </div>
    <div class="footer">
      Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
`
}
