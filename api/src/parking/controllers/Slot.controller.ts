import { Controller, Inject, Get, Post, Put, Patch, Delete, Permissions } from '../../core/decorators/decorators.js'
import Validator from '../../core/utils/Validator.js'
import { PERMISSIONS } from '../constants/authorities.js'
import SlotService from '../services/Slot.service.js'
import SlotDTO from '../dtos/Slot.dto.js'

@Controller('/slots')
export class SlotController {

    constructor(
        @Inject(SlotService)
        private slotService: SlotService
    ) { }

    @Get('/')
    @Permissions([PERMISSIONS.SLOT.READ])
    async findAll(request, response) {
        const slots = await this.slotService.findAll()

        return response.status(200).json(slots.map(s => new SlotDTO(s)))
    }

    @Get('/:id')
    @Permissions([PERMISSIONS.SLOT.READ])
    async findById(request, response) {
        const { id } = request.params || {}

        Validator.required({ id }).isUUID({ id })

        const slot = await this.slotService.findById(id)

        return response.status(200).json(new SlotDTO(slot))
    }

    @Get('/parking/:parkingId')
    @Permissions([PERMISSIONS.SLOT.READ])
    async findByParking(request, response) {
        const { parkingId } = request.params || {}

        Validator.required({ parkingId }).isUUID({ parkingId })

        const slots = await this.slotService.findByParking(parkingId)

        return response.status(200).json(slots.map(s => new SlotDTO(s)))
    }

    @Post('/')
    @Permissions([PERMISSIONS.SLOT.CREATE])
    async create(request, response) {
        const { code, parkingId, isOccupied } = request.body || {}

        Validator
            .required({ code, parkingId })
            .isUUID({ parkingId })

        if (isOccupied !== undefined) Validator.isBoolean({ isOccupied })

        const slot = await this.slotService.create({
            code,
            parkingId,
            ...(isOccupied !== undefined && { isOccupied })
        })

        return response.status(201).json(new SlotDTO(slot))
    }

    @Put('/:id')
    @Permissions([PERMISSIONS.SLOT.UPDATE])
    async update(request, response) {
        const { id } = request.params || {}
        const { code, isOccupied } = request.body || {}

        Validator
            .required({ id, code, isOccupied })
            .isUUID({ id })
            .isBoolean({ isOccupied })

        const slot = await this.slotService.update(id, { code, isOccupied })

        return response.status(200).json(new SlotDTO(slot))
    }

    @Patch('/:id/occupy')
    @Permissions([PERMISSIONS.SLOT.UPDATE])
    async occupy(request, response) {
        const { id } = request.params || {}

        Validator.required({ id }).isUUID({ id })

        const slot = await this.slotService.occupy(id)

        return response.status(200).json(new SlotDTO(slot))
    }

    @Patch('/:id/free')
    @Permissions([PERMISSIONS.SLOT.UPDATE])
    async free(request, response) {
        const { id } = request.params || {}

        Validator.required({ id }).isUUID({ id })

        const slot = await this.slotService.free(id)

        return response.status(200).json(new SlotDTO(slot))
    }

    @Delete('/:id')
    @Permissions([PERMISSIONS.SLOT.DELETE])
    async delete(request, response) {
        const { id } = request.params || {}

        Validator.required({ id }).isUUID({ id })

        await this.slotService.delete(id)

        return response.status(200).json({ message: `Sitio "${id}" eliminado correctamente` })
    }

}

export default SlotController
