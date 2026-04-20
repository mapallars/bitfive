import { Inject, Service } from "../../core/decorators/decorators.js"
import SlotRepository from "../repositories/Slot.repository.js"
import ParkingRepository from "../repositories/Parking.repository.js"
import Slot from "../entities/Slot.entity.js"
import { NotFoundError } from "../../core/errors/NotFound.error.js"
import { InvalidFormatError } from "../../core/errors/InvalidFormat.error.js"

@Service()
export class SlotService {

    constructor(
        @Inject(SlotRepository)
        private slotRepository: SlotRepository,
        @Inject(ParkingRepository)
        private parkingRepository: ParkingRepository
    ) { }

    async findAll() {
        return await this.slotRepository.findAll()
    }

    async findById(id: string) {
        const slot = await this.slotRepository.findById(id)

        if (!slot) throw new NotFoundError(`El sitio con id "${id}" no existe`)

        return slot
    }

    async findByParking(parkingId: string) {
        const parking = await this.parkingRepository.findById(parkingId)

        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        return await this.slotRepository.findManyBy('parkingId', parkingId)
    }

    async create(data: Partial<Slot> & { parkingId?: string }) {
        const { parkingId } = data

        if (!parkingId) throw new InvalidFormatError('El campo "parkingId" es obligatorio')

        const parking = await this.parkingRepository.findById(parkingId)
        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        return await this.slotRepository.create(data as Partial<Slot>)
    }

    async generateForParking(parkingId: string, count: number) {
        const parking = await this.parkingRepository.findById(parkingId)
        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        if (!Number.isInteger(count) || count <= 0) {
            throw new InvalidFormatError('El campo "count" debe ser un entero mayor a 0')
        }

        const width = Math.max(2, String(count).length)
        const created: Slot[] = []

        for (let i = 1; i <= count; i++) {
            const code = `S-${String(i).padStart(width, '0')}`
            const slot = await this.slotRepository.create({
                code,
                isOccupied: false,
                parkingId
            } as Partial<Slot> & { parkingId: string })
            created.push(slot)
        }

        return created
    }

    async generateAdditional(parkingId: string, startFrom: number, count: number, totalCapacity: number) {
        const parking = await this.parkingRepository.findById(parkingId)
        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        if (!Number.isInteger(count) || count <= 0) {
            throw new InvalidFormatError('El campo "count" debe ser un entero mayor a 0')
        }

        const width = Math.max(2, String(totalCapacity).length)
        const created: Slot[] = []

        for (let i = 1; i <= count; i++) {
            const code = `S-${String(startFrom + i).padStart(width, '0')}`
            const slot = await this.slotRepository.create({
                code,
                isOccupied: false,
                parkingId
            } as Partial<Slot> & { parkingId: string })
            created.push(slot)
        }

        return created
    }

    async occupy(id: string) {
        const slot = await this.slotRepository.findById(id)
        if (!slot) throw new NotFoundError(`El sitio con id "${id}" no existe`)

        const updated = await this.slotRepository.occupyById(id)

        if (!updated) {
            throw new InvalidFormatError(`El sitio "${slot.code}" ya está ocupado`)
        }

        return updated
    }

    async free(id: string) {
        const slot = await this.slotRepository.findById(id)
        if (!slot) throw new NotFoundError(`El sitio con id "${id}" no existe`)

        const updated = await this.slotRepository.freeById(id)

        if (!updated) {
            throw new InvalidFormatError(`El sitio "${slot.code}" ya está libre`)
        }

        return updated
    }

    async update(id: string, data: Partial<Slot>) {
        const slot = await this.slotRepository.findById(id)
        if (!slot) throw new NotFoundError(`El sitio con id "${id}" no existe`)

        return await this.slotRepository.update(id, data)
    }

    async delete(id: string) {
        const slot = await this.slotRepository.findById(id)
        if (!slot) throw new NotFoundError(`El sitio con id "${id}" no existe`)

        return await this.slotRepository.delete(id)
    }

}

export default SlotService
