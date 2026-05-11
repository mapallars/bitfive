import { escapeHtml } from './utils/escapeHtml.js'

export interface EventUpdateTemplateData {
    userName: string
    eventName: string
    eventDate: string
    eventLocation: string
}

export function eventUpdateTemplate(data: EventUpdateTemplateData): string {
    const userName = escapeHtml(data.userName)
    const eventName = escapeHtml(data.eventName)
    const eventDate = escapeHtml(data.eventDate)
    const eventLocation = escapeHtml(data.eventLocation)

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Actualización de Evento</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #e67e22; color: #fff; padding: 30px 40px; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 40px; color: #333; }
    .event-details { background: #fef9f4; border-left: 4px solid #e67e22; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .event-details p { margin: 6px 0; font-size: 14px; }
    .event-details strong { color: #1a1a2e; }
    .footer { background: #f4f4f4; text-align: center; padding: 16px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Evento Actualizado</h1>
    </div>
    <div class="body">
      <p>Hola <strong>${userName}</strong>,</p>
      <p>El organizador del evento en el que estás inscrito ha realizado cambios importantes. Por favor revisa los nuevos detalles:</p>
      <div class="event-details">
        <p><strong>Evento:</strong> ${eventName}</p>
        <p><strong>Nueva fecha:</strong> ${eventDate}</p>
        <p><strong>Nuevo lugar:</strong> ${eventLocation}</p>
      </div>
      <p>Tu código QR de asistencia sigue siendo válido. Si tienes dudas, contacta al organizador del evento.</p>
    </div>
    <div class="footer">
      Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
`
}
