import { Controller, Inject, Get, Post, Put, Delete, Permissions } from '../../core/decorators/decorators.js'
import Validator from '../../core/utils/Validator.js'
import { InvalidFormatError } from '../../core/errors/InvalidFormat.error.js'
import { PERMISSIONS } from '../constants/authorities.js'
import ParkingService from '../services/Parking.service.js'
import ParkingDTO from '../dtos/Parking.dto.js'

@Controller('/parking')
export class ParkingController {

    constructor(
        @Inject(ParkingService)
        private parkingService: ParkingService
    ) { }

    @Get('/')
    @Permissions([PERMISSIONS.PARKING.READ])
    async findAll(request, response) {
        const parkings = await this.parkingService.findAll()

        return response.status(200).json(parkings.map(p => new ParkingDTO(p)))
    }

    @Get('/:id')
    @Permissions([PERMISSIONS.PARKING.READ])
    async findById(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        const parking = await this.parkingService.findById(id)

        return response.status(200).json(new ParkingDTO(parking))
    }

    @Get('/event/:eventId')
    @Permissions([PERMISSIONS.PARKING.READ])
    async findByEventId(request, response) {
        const { eventId } = request.params || {}

        Validator.required({ eventId })

        const parkings = await this.parkingService.findByEventId(eventId)

        return response.status(200).json(parkings.map(p => new ParkingDTO(p)))
    }

    @Post('/')
    @Permissions([PERMISSIONS.PARKING.CREATE])
    async create(request, response) {
        const { name, description, type, location, capacity, isAvailable } = request.body || {}

        Validator
            .required({ name, location, capacity, isAvailable })
            .isInteger({ capacity })
            .isBoolean({ isAvailable })

        if (Number(capacity) <= 0) {
            throw new InvalidFormatError('El campo "capacity" debe ser mayor a 0')
        }

        const parking = await this.parkingService.create({ name, description, type, location, capacity, isAvailable })

        return response.status(201).json(new ParkingDTO(parking))
    }

    @Post('/:id/events/:eventId')
    @Permissions([PERMISSIONS.PARKING.UPDATE])
    async addEvent(request, response) {
        const { id, eventId } = request.params || {}

        Validator.required({ id, eventId })

        const parking = await this.parkingService.addEvent(id, eventId)

        return response.status(200).json(new ParkingDTO(parking))
    }

    @Delete('/:id/events/:eventId')
    @Permissions([PERMISSIONS.PARKING.UPDATE])
    async removeEvent(request, response) {
        const { id, eventId } = request.params || {}

        Validator.required({ id, eventId })

        const parking = await this.parkingService.removeEvent(id, eventId)

        return response.status(200).json(new ParkingDTO(parking))
    }

    @Put('/:id')
    @Permissions([PERMISSIONS.PARKING.UPDATE])
    async update(request, response) {
        const { id } = request.params || {}
        const { name, description, type, location, capacity, isAvailable } = request.body || {}

        Validator
            .required({ id, name, location, capacity, isAvailable })
            .isInteger({ capacity })
            .isBoolean({ isAvailable })

        if (Number(capacity) <= 0) {
            throw new InvalidFormatError('El campo "capacity" debe ser mayor a 0')
        }

        const parking = await this.parkingService.update(id, { name, description, type, location, capacity, isAvailable })

        return response.status(200).json(new ParkingDTO(parking))
    }

    @Delete('/:id')
    @Permissions([PERMISSIONS.PARKING.DELETE])
    async delete(request, response) {
        const { id } = request.params || {}

        Validator.required({ id })

        await this.parkingService.delete(id)

        return response.status(200).json({ message: `Parqueadero "${id}" eliminado correctamente` })
    }

}
