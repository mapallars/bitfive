import { Inject, Service } from '../../core/decorators/decorators.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import EnrollmentRepository from '../repositories/Enrollment.repository.js'
import Enrollment from '../entities/Enrollment.entity.js'
import User from '../../auth/entities/User.entity.js'
import EventRepository from '../../event/repositories/Event.repository.js'
import UserRepository from '../../auth/repositories/User.repository.js'
import { ForbiddenError } from '../../core/errors/Forbidden.error.js'
import { mailerQueue } from '../../notification/queues/Mailer.queue.js'

@Service()
export class EnrollmentService {

    constructor(
        @Inject(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
        @Inject(EventRepository)
        private eventRepository: EventRepository,
        @Inject(UserRepository)
        private userRepository: UserRepository,
    ) { }

    async findAll() {
        return await this.enrollmentRepository.findAll()
    }

    async findById(id: string) {
        const enrollment = await this.enrollmentRepository.findById(id)
        if (!enrollment) {
            throw new NotFoundError('La inscripción no existe')
        }
        return enrollment
    }

    async findManyByUserId(id: string) {
        const user = await this.userRepository.findById(id)
        if (!user) {
            throw new NotFoundError('El usuario al que intentas obtener las inscripciones no existe')
        }
        const enrollments = await this.enrollmentRepository.findManyBy('userId', id)
        return enrollments
    }

    async findManyByEventId(id: string) {
        const event = await this.eventRepository.findById(id)
        if (!event) {
            throw new NotFoundError('El evento al que intentas obtener las inscripciones no existe')
        }
        const enrollments = await this.enrollmentRepository.findManyBy('eventId', id)
        return enrollments
    }

    async getAttendanceReport(eventId: string) {
        const event = await this.eventRepository.findById(eventId)
        if (!event) {
            throw new NotFoundError('El evento no existe')
        }
        const report = await this.enrollmentRepository.findAttendanceReport(eventId)
        const enrollments = await this.enrollmentRepository.findManyBy('eventId', eventId)
        return {
            event: { id: event.id, name: event.name },
            ...report,
            enrollments,
        }
    }

    async create(enrollment: Partial<Enrollment>, user: User) {
        const created = await this.enrollmentRepository.create({ ...enrollment, user: user, createdAt: new Date(), createdBy: user.username })

        try {
            const fullEnrollment = await this.enrollmentRepository.findById(created.id)

            if (fullEnrollment?.user?.email && fullEnrollment?.event) {
                await mailerQueue.add('enrollment-confirmation', {
                    enrollmentId: fullEnrollment.id,
                    userEmail: fullEnrollment.user.email,
                    userName: fullEnrollment.user.username,
                    eventName: fullEnrollment.event.name,
                    eventDate: new Date(fullEnrollment.event.startAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                    eventLocation: fullEnrollment.event.location,
                })
            }
        } catch (err: any) {
            console.error(`[Enrollment] Error al encolar correo de confirmación (enrollmentId=${created.id}):`, err.message)
        }

        return created
    }

    async update(id: string, enrollment: Partial<Enrollment>, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError('La inscripción no existe')
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, 'No puedes editar esta inscripción porque no eres el dueño')
        return await this.enrollmentRepository.update(id, { ...enrollment, updatedAt: new Date(), updatedBy: user.username })
    }

    async cancel(id: string, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError('La inscripción no existe')
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, 'No puedes cancelar esta inscripción porque no eres el dueño')
        return await this.enrollmentRepository.update(id, { enrollmentStatus: 'CANCELLED', updatedAt: new Date(), updatedBy: user.username })
    }

    async delete(id: string, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError('La inscripción no existe')
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, 'No puedes eliminar esta inscripción porque no eres el dueño')
        return await this.enrollmentRepository.delete(id, user.username)
    }

    private _checkEnrollmentPermissions(enrollment: Enrollment, user: User, message: string) {
        if (enrollment.user.id !== user.id) {
            throw new ForbiddenError(message)
        }
    }

}

export default EnrollmentService
