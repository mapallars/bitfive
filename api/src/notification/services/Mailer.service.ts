import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TLS_INSECURE } from '../../core/config/mailer.config.js'
import { confirmationTemplate } from '../templates/confirmation.template.js'
import { eventUpdateTemplate } from '../templates/event-update.template.js'
import { checkInTemplate } from '../templates/checkin.template.js'
import { reminderTemplate } from '../templates/reminder.template.js'

export interface EnrollmentConfirmationData {
    enrollmentId: string
    userEmail: string
    userName: string
    eventName: string
    eventDate: string
    eventLocation: string
}

export interface EventUpdateData {
    userEmail: string
    userName: string
    eventName: string
    eventDate: string
    eventLocation: string
}

export interface CheckInConfirmationData {
    userEmail: string
    userName: string
    eventName: string
    checkedInAt: string
}

export interface ReminderData {
    userEmail: string
    userName: string
    eventName: string
    eventDate: string
    eventLocation: string
}

class MailerService {

    private _transporter: nodemailer.Transporter | null = null

    private get transporter(): nodemailer.Transporter {
        if (!this._transporter) {
            const port = SMTP_PORT()
            this._transporter = nodemailer.createTransport({
                host: SMTP_HOST(),
                port,
                secure: port === 465,
                auth: {
                    user: SMTP_USER(),
                    pass: SMTP_PASS(),
                },
                tls: {
                    rejectUnauthorized: !SMTP_TLS_INSECURE(),
                },
            })
        }
        return this._transporter
    }

    async sendEnrollmentConfirmation(data: EnrollmentConfirmationData): Promise<void> {
        const qrBuffer = await QRCode.toBuffer(data.enrollmentId)

        const html = confirmationTemplate({
            userName: data.userName,
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
        })

        await this.transporter.sendMail({
            from: SMTP_FROM(),
            to: data.userEmail,
            subject: `Confirmación de inscripción — ${data.eventName}`,
            html,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrBuffer,
                    cid: 'qr-code',
                },
            ],
        })
    }

    async sendEventUpdate(data: EventUpdateData): Promise<void> {
        const html = eventUpdateTemplate({
            userName: data.userName,
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
        })

        await this.transporter.sendMail({
            from: SMTP_FROM(),
            to: data.userEmail,
            subject: `Actualización importante — ${data.eventName}`,
            html,
        })
    }

    async sendCheckInConfirmation(data: CheckInConfirmationData): Promise<void> {
        const html = checkInTemplate({
            userName: data.userName,
            eventName: data.eventName,
            checkedInAt: data.checkedInAt,
        })

        await this.transporter.sendMail({
            from: SMTP_FROM(),
            to: data.userEmail,
            subject: `Asistencia registrada — ${data.eventName}`,
            html,
        })
    }

    async sendReminder(data: ReminderData): Promise<void> {
        const html = reminderTemplate({
            userName: data.userName,
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
        })

        await this.transporter.sendMail({
            from: SMTP_FROM(),
            to: data.userEmail,
            subject: `Recordatorio: mañana es ${data.eventName}`,
            html,
        })
    }
}

export default new MailerService()
