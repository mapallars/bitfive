import { Inject, Service } from "../../core/decorators/decorators.js"
import ParkingRepository from "../repositories/Parking.repository.js"
import Parking from "../entities/Parking.entity.js"
import { NotFoundError } from "../../core/errors/NotFound.error.js"
import EventRepository from "../../event/repositories/Event.repository.js"

@Service()
export class ParkingService {

    constructor(
        @Inject(ParkingRepository)
        private parkingRepository: ParkingRepository,
        @Inject(EventRepository)
        private eventRepository: EventRepository
    ) { }

    async findAll() {
        return await this.parkingRepository.findAll()
    }

    async findById(id: string) {
        const parking = await this.parkingRepository.findById(id)

        if (!parking) throw new NotFoundError('El parqueadero no existe')

        return parking
    }

    async findByEventId(eventId: string) {
        const event = await this.eventRepository.findById(eventId, false, { relations: ['parkings'] })

        if (!event) throw new NotFoundError('El evento no existe')

        return event.parkings || []
    }

    async create(data: Partial<Parking>) {
        return await this.parkingRepository.create(data)
    }

    async addEvent(parkingId: string, eventId: string) {
        const parking = await this.parkingRepository.findById(parkingId)
        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        const event = await this.eventRepository.findById(eventId)
        if (!event) throw new NotFoundError(`El evento con id "${eventId}" no existe`)

        const parkings = event.parkings || []
        const alreadyLinked = parkings.some(p => p.id === parkingId)
        if (!alreadyLinked) {
            parkings.push(parking)
        }

        return await this.eventRepository.update(eventId, { parkings })
    }

    async removeEvent(parkingId: string, eventId: string) {
        const parking = await this.parkingRepository.findById(parkingId)
        if (!parking) throw new NotFoundError(`El parqueadero con id "${parkingId}" no existe`)

        const event = await this.eventRepository.findById(eventId)
        if (!event) throw new NotFoundError(`El evento con id "${eventId}" no existe`)

        const parkings = (event.parkings || []).filter(p => p.id !== parkingId)

        return await this.eventRepository.update(eventId, { parkings })
    }

    async update(id: string, data: Partial<Parking>) {
        const parking = await this.parkingRepository.findById(id)

        if (!parking) throw new NotFoundError(`El parqueadero con id "${id}" no existe`)

        return await this.parkingRepository.update(id, data)
    }

    async delete(id: string) {
        const parking = await this.parkingRepository.findById(id)

        if (!parking) throw new NotFoundError(`El parqueadero con id "${id}" no existe`)

        return await this.parkingRepository.delete(id)
    }

}

export default ParkingService
