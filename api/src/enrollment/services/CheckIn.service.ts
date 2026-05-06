import { Inject, Service } from '../../core/decorators/decorators.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import { AlreadyExistError } from '../../core/errors/AlreadyExist.error.js'
import { ForbiddenError } from '../../core/errors/Forbidden.error.js'
import EnrollmentRepository from '../repositories/Enrollment.repository.js'
import { mailerQueue } from '../../notification/queues/Mailer.queue.js'

@Service()
export class CheckInService {

    constructor(
        @Inject(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
    ) { }

    async checkIn(enrollmentId: string, eventId: string) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId)

        if (!enrollment) {
            throw new NotFoundError('La inscripción no existe o el código QR no es válido')
        }

        if (enrollment.enrollmentStatus === 'CANCELLED') {
            throw new ForbiddenError('La inscripción está cancelada y no permite check-in')
        }

        if (enrollment.checkedInAt) {
            throw new AlreadyExistError('El código QR ya fue utilizado para registrar asistencia')
        }

        if (enrollment.event?.id !== eventId) {
            throw new ForbiddenError('El código QR pertenece a un evento diferente')
        }

        const updated = await this.enrollmentRepository.update(enrollmentId, {
            enrollmentStatus: 'CHECKED_IN',
            checkedInAt: new Date(),
        })

        try {
            if (enrollment.user?.email) {
                await mailerQueue.add('checkin-confirmation', {
                    userEmail: enrollment.user.email,
                    userName: enrollment.user.username,
                    eventName: enrollment.event?.name,
                    checkedInAt: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                })
            }
        } catch (err: any) {
            console.error('[CheckInService] Error al encolar correo de check-in:', err.message)
        }

        return updated
    }

}

export default CheckInService
