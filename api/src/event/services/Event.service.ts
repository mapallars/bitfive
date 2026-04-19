import { Service } from "../../core/decorators/service.decorator.js"
import { Inject } from "../../core/decorators/inject.decorator.js"
import EventRepository from "../repositories/Event.repository.js"
import ParkingRepository from "../../parking/repositories/Parking.repository.js"
import UserRepository from "../../auth/repositories/User.repository.js"
import Event from "../entities/Event.entity.js"
import { NotFoundError } from '../../core/errors/NotFound.error.js'

@Service()
export class EventService {

    constructor(
        @Inject(EventRepository)
        private eventRepository: EventRepository,
        @Inject(ParkingRepository)
        private parkingRepository: ParkingRepository,
        @Inject(UserRepository)
        private userRepository: UserRepository
    ) { }

    async findAll() {
        return await this.eventRepository.findAll()
    }

    async findById(id: string) {
        const event = await this.eventRepository.findById(id)
        if (!event) {
            throw new NotFoundError("El evento no existe")
        }
        return event
    }

    async findByIdWithParkings(id: string) {
        const event = await this.eventRepository.findById(id, false, { relations: ['parkings'] })
        if (!event) {
            throw new NotFoundError("El evento no existe")
        }
        return event
    }

    async findByName(name: string) {
        const event = await this.eventRepository.findOneBy('name', name)
        if (!event) {
            throw new NotFoundError("El evento no existe")
        }
        return event
    }

    async create(event: Partial<Event>) {
        return await this.eventRepository.create(event)
    }

    async update(id: string, event: Partial<Event>) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        return await this.eventRepository.update(id, event)
    }

    async delete(id: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        return await this.eventRepository.delete(id)
    }

    async assignParking(id: string, parkingId: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        const existingParking = await this.parkingRepository.findById(parkingId)
        if (!existingParking) {
            throw new NotFoundError("El parking no existe")
        }
        return await this.eventRepository.update(id, { parkings: [...existingEvent.parkings, existingParking] })
    }

    async unassignParking(id: string, parkingId: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        const existingParking = await this.parkingRepository.findById(parkingId)
        if (!existingParking) {
            throw new NotFoundError("El parking no existe")
        }
        return await this.eventRepository.update(id, { parkings: existingEvent.parkings.filter(p => p.id !== parkingId) })
    }

    async assignOrganizer(id: string, organizerId: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        const existingOrganizer = await this.userRepository.findById(organizerId)
        if (!existingOrganizer) {
            throw new NotFoundError("El organizador no existe")
        }
        return await this.eventRepository.update(id, { organizers: [...existingEvent.organizers, existingOrganizer] })
    }

    async unassignOrganizer(id: string, organizerId: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        const existingOrganizer = await this.userRepository.findById(organizerId)
        if (!existingOrganizer) {
            throw new NotFoundError("El organizador no existe")
        }
        return await this.eventRepository.update(id, { organizers: existingEvent.organizers.filter(o => o.id !== organizerId) })
    }

}
export default EventService