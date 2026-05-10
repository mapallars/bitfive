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
        const updated = await this.enrollmentRepository.checkInAtomic(enrollmentId, eventId, 'system')

        if (!updated) {
            const enrollment = await this.enrollmentRepository.findById(enrollmentId)

            if (!enrollment) {
                throw new NotFoundError('La inscripción no existe o el código QR no es válido')
            }
            if (enrollment.event?.id !== eventId) {
                throw new ForbiddenError('El código QR pertenece a un evento diferente')
            }
            if (enrollment.enrollmentStatus === 'CANCELLED') {
                throw new ForbiddenError('La inscripción está cancelada y no permite check-in')
            }
            if (enrollment.checkedInAt) {
                throw new AlreadyExistError('El código QR ya fue utilizado para registrar asistencia')
            }

            throw new NotFoundError('La inscripción no existe o el código QR no es válido')
        }

        const fullEnrollment = await this.enrollmentRepository.findById(enrollmentId)

        try {
            if (fullEnrollment?.user?.email) {
                await mailerQueue.add('checkin-confirmation', {
                    userEmail: fullEnrollment.user.email,
                    userName: fullEnrollment.user.username,
                    eventName: fullEnrollment.event?.name,
                    checkedInAt: new Date(updated.checkedInAt!).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                })
            }
        } catch (err: any) {
            console.error(`[CheckIn] Error al encolar correo de check-in (enrollmentId=${enrollmentId}):`, err.message)
        }

        return fullEnrollment
    }

}

export default CheckInService
