import { Permissions } from "../../core/decorators/auth.decorator.js"
import { Controller } from "../../core/decorators/controller.decorator.js"
import { Inject } from "../../core/decorators/inject.decorator.js"
import { Delete, Get, Post, Put } from "../../core/decorators/route.decorator.js"
import Validator from "../../core/utils/Validator.js"
import { PERMISSIONS } from "../constants/authorities.js"
import EnrollmentDTO from "../dtos/Enrollment.dto.js"
import EnrollmentService from "../services/Enrollment.service.js"

@Controller('/enrollments')
export class EnrollmentController {

    constructor(
        @Inject(EnrollmentService)
        private enrollmentService: EnrollmentService
    ) { }

    @Get('/')
    @Permissions([PERMISSIONS.ENROLLMENT.READ])
    async findAll(request, response) {
        const enrollments = await this.enrollmentService.findAll()

        return response.status(200).json(enrollments.map(enrollment => new EnrollmentDTO(enrollment)))
    }

    @Get('/my')
    @Permissions([PERMISSIONS.ENROLLMENT.READ])
    async findMyEnrollments(request, response) {
        const enrollments = await this.enrollmentService.findManyByUserId(request.user.id)

        return response.status(200).json(enrollments.map(enrollment => new EnrollmentDTO(enrollment)))
    }

    @Get('/user/:id')
    @Permissions([PERMISSIONS.ENROLLMENT.READ])
    async findByUserId(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const enrollments = await this.enrollmentService.findManyByUserId(id)

        return response.status(200).json(enrollments.map(enrollment => new EnrollmentDTO(enrollment)))
    }

    @Get('/event/:id')
    @Permissions([PERMISSIONS.ENROLLMENT.READ])
    async findByEventId(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const enrollments = await this.enrollmentService.findManyByEventId(id)

        return response.status(200).json(enrollments.map(enrollment => new EnrollmentDTO(enrollment)))
    }

    @Get('/:id')
    @Permissions([PERMISSIONS.ENROLLMENT.READ])
    async findById(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const enrollment = await this.enrollmentService.findById(id)

        return response.status(200).json(new EnrollmentDTO(enrollment))
    }

    @Post('/')
    @Permissions([PERMISSIONS.ENROLLMENT.CREATE])
    async create(request, response) {
        const { eventId, enrollmentStatus } = request.body

        Validator
            .required({ eventId, enrollmentStatus })
            .isIn({ enrollmentStatus }, ['PENDING', 'CONFIRMED', 'CANCELLED'])

        const enrollment = await this.enrollmentService.create({ event: { id: eventId }, enrollmentStatus }, request.user)

        return response.status(201).json(new EnrollmentDTO(enrollment))
    }

    @Put('/:id')
    @Permissions([PERMISSIONS.ENROLLMENT.UPDATE])
    async update(request, response) {
        const { id } = request.params
        const { enrollmentStatus } = request.body

        Validator
            .required({ id, enrollmentStatus })
            .isIn({ enrollmentStatus }, ['PENDING', 'CONFIRMED', 'CANCELLED'])

        const enrollment = await this.enrollmentService.update(id, { enrollmentStatus }, request.user)

        return response.status(200).json(new EnrollmentDTO(enrollment))
    }

    @Put('/:id/cancel')
    @Permissions([PERMISSIONS.ENROLLMENT.UPDATE])
    async cancel(request, response) {
        const { id } = request.params

        Validator.required({ id })

        const enrollment = await this.enrollmentService.cancel(id, request.user)

        return response.status(200).json(new EnrollmentDTO(enrollment))
    }

    @Delete('/:id')
    @Permissions([PERMISSIONS.ENROLLMENT.DELETE])
    async delete(request, response) {
        const { id } = request.params

        Validator.required({ id })

        await this.enrollmentService.delete(id, request.user)

        return response.status(204).json({ message: `Inscripción "${id}" eliminada correctamente` })
    }

}

export default EnrollmentController
