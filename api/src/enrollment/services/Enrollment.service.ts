import { Inject, Service } from "../../core/decorators/decorators.js";
import { NotFoundError } from "../../core/errors/NotFound.error.js";
import EnrollmentRepository from "../repositories/Enrollment.repository.js";
import Enrollment from "../entities/Enrollment.entity.js"
import User from "../../auth/entities/User.entity.js"
import EventRepository from "../../event/repositories/Event.repository.js";
import UserRepository from "../../auth/repositories/User.repository.js";
import { ForbiddenError } from "../../core/errors/Forbidden.error.js";

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
            throw new NotFoundError("La inscripción no existe")
        }
        return enrollment
    }

    async findManyByUserId(id: string) {
        const user = await this.userRepository.findById(id)
        if (!user) {
            throw new NotFoundError("El usuario al que intentas obtener las inscripciones no existe")
        }
        const enrollments = await this.enrollmentRepository.findManyByUserId(id)
        return enrollments
    }

    async findManyByEventId(id: string) {
        const event = await this.eventRepository.findById(id)
        if (!event) {
            throw new NotFoundError("El evento al que intentas obtener las inscripciones no existe")
        }
        const enrollments = await this.enrollmentRepository.findManyByEventId(id)
        return enrollments
    }

    async create(enrollment: Partial<Enrollment>, user: User) {
        return await this.enrollmentRepository.create({ ...enrollment, user: user, createdAt: new Date(), createdBy: user.username })
    }

    async update(id: string, enrollment: Partial<Enrollment>, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError("La inscripción no existe")
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, "No puedes editar esta inscripción porque no eres el dueño")
        return await this.enrollmentRepository.update(id, { ...enrollment, updatedAt: new Date(), updatedBy: user.username })
    }

    async cancel(id: string, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError("La inscripción no existe")
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, "No puedes cancelar esta inscripción porque no eres el dueño")
        return await this.enrollmentRepository.update(id, { enrollmentStatus: 'CANCELLED', updatedAt: new Date(), updatedBy: user.username })
    }

    async delete(id: string, user: User) {
        const existingEnrollment = await this.enrollmentRepository.findById(id)
        if (!existingEnrollment) {
            throw new NotFoundError("La inscripción no existe")
        }
        this._checkEnrollmentPermissions(existingEnrollment, user, "No puedes eliminar esta inscripción porque no eres el dueño")
        return await this.enrollmentRepository.delete(id, user.username)
    }

    private _checkEnrollmentPermissions(enrollment: Enrollment, user: User, message: string) {
        if (enrollment.user.id !== user.id) {
            throw new ForbiddenError(message)
        }
    }

}

export default EnrollmentService