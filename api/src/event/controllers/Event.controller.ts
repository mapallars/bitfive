import { Permissions } from "../../core/decorators/auth.decorator.js"
import { Controller } from "../../core/decorators/controller.decorator.js"
import { Inject } from "../../core/decorators/inject.decorator.js"
import { Delete, Get, Post, Put } from "../../core/decorators/route.decorator.js"
import Validator from "../../core/utils/Validator.js"
import { InvalidFormatError } from "../../core/errors/InvalidFormat.error.js"
import { PERMISSIONS } from "../constants/authorities.js"
import EventDTO from "../dtos/Event.dto.js"
import EventService from "../services/Event.service.js"
import ParkingDTO from "../../parking/dtos/Parking.dto.js"

@Controller('/events')
export class EventController {

    constructor(
        @Inject(EventService)
        private eventService: EventService
    ) { }

    @Get('/')
    @Permissions([PERMISSIONS.EVENT.READ])
    async findAll(request, response) {
        const events = await this.eventService.findAll()

        return response.status(200).json(events.map(event => new EventDTO(event)))
    }

    @Get('/:id')
    @Permissions([PERMISSIONS.EVENT.READ])
    async findById(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const event = await this.eventService.findById(id)

        return response.status(200).json(new EventDTO(event))
    }

    @Get('/:id/parkings')
    @Permissions([PERMISSIONS.EVENT.READ])
    async findParkingsByEvent(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const event = await this.eventService.findByIdWithParkings(id)

        return response.status(200).json((event.parkings || []).map(p => new ParkingDTO(p)))
    }

    @Post('/')
    @Permissions([PERMISSIONS.EVENT.CREATE])
    async create(request, response) {
        const { name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price } = request.body

        Validator
            .required({ name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price })
            .isDate({ startAt, endAt })
            .isNumeric({ maxCapacity, price })

        if (Number(maxCapacity) <= 0) {
            throw new InvalidFormatError('El campo "maxCapacity" debe ser mayor a 0')
        }

        if (Number(price) < 0) {
            throw new InvalidFormatError('El campo "price" debe ser mayor o igual a 0')
        }

        const startDate = new Date(startAt)
        if (startDate <= new Date()) {
            throw new InvalidFormatError('La fecha del evento debe ser futura')
        }

        const endDate = new Date(endAt)
        if (endDate <= startDate) {
            throw new InvalidFormatError('La fecha de fin del evento debe ser mayor a la fecha de inicio')
        }

        if (startDate > endDate) {
            throw new InvalidFormatError('La fecha de inicio del evento debe ser menor a la fecha de fin')
        }

        const event = await this.eventService.create({ name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price })

        return response.status(201).json(new EventDTO(event))
    }

    @Put('/:id')
    @Permissions([PERMISSIONS.EVENT.UPDATE])
    async update(request, response) {
        const { id } = request.params
        const { name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price } = request.body

        Validator
            .required({ name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price })
            .isDate({ startAt, endAt })
            .isNumeric({ maxCapacity, price })

        if (Number(maxCapacity) <= 0) {
            throw new InvalidFormatError('El campo "maxCapacity" debe ser mayor a 0')
        }

        if (Number(price) < 0) {
            throw new InvalidFormatError('El campo "price" debe ser mayor o igual a 0')
        }

        const startDate = new Date(startAt)
        if (startDate <= new Date()) {
            throw new InvalidFormatError('La fecha del evento debe ser futura')
        }

        const endDate = new Date(endAt)
        if (endDate <= startDate) {
            throw new InvalidFormatError('La fecha de fin del evento debe ser mayor a la fecha de inicio')
        }

        if (startDate > endDate) {
            throw new InvalidFormatError('La fecha de inicio del evento debe ser menor a la fecha de fin')
        }

        const event = await this.eventService.update(id, { name, description, category, cover, color, location, startAt, endAt, timezone, type, visibility, eventStatus, maxCapacity, hasParking, price })

        return response.status(200).json(new EventDTO(event))
    }

    @Post('/:id/parkings')
    @Permissions([PERMISSIONS.EVENT.UPDATE])
    async assignParking(request, response) {
        const { id } = request.params
        const { parkingId } = request.body

        Validator.required({ id, parkingId })

        const event = await this.eventService.assignParking(id, parkingId)

        return response.status(200).json(new EventDTO(event))
    }

    @Delete('/:id/parkings')
    @Permissions([PERMISSIONS.EVENT.UPDATE])
    async revokeParking(request, response) {
        const { id } = request.params
        const { parkingId } = request.body

        Validator.required({ id, parkingId })

        const event = await this.eventService.unassignParking(id, parkingId)

        return response.status(200).json(new EventDTO(event))
    }

    @Post('/:id/organizers')
    @Permissions([PERMISSIONS.EVENT.UPDATE])
    async assignOrganizer(request, response) {
        const { id } = request.params
        const { organizerId } = request.body

        Validator.required({ id, organizerId })

        const event = await this.eventService.assignOrganizer(id, organizerId)

        return response.status(200).json(new EventDTO(event))
    }

    @Delete('/:id/organizers')
    @Permissions([PERMISSIONS.EVENT.UPDATE])
    async revokeOrganizer(request, response) {
        const { id } = request.params
        const { organizerId } = request.body

        Validator.required({ id, organizerId })

        const event = await this.eventService.unassignOrganizer(id, organizerId)

        return response.status(200).json(new EventDTO(event))
    }

    @Delete('/:id')
    @Permissions([PERMISSIONS.EVENT.DELETE])
    async delete(request, response) {
        const { id } = request.params

        Validator.required({ id })

        await this.eventService.delete(id)

        return response.status(204).json({ message: `Evento "${id}" eliminado correctamente` })
    }

}

export default EventController