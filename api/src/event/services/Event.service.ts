import { Service } from "../../core/decorators/service.decorator.js"
import { Inject } from "../../core/decorators/inject.decorator.js"
import EventRepository from "../repositories/Event.repository.js"
import ParkingRepository from "../../parking/repositories/Parking.repository.js"
import UserRepository from "../../auth/repositories/User.repository.js"
import Event from "../entities/Event.entity.js"
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import { ForbiddenError } from "../../core/errors/Forbidden.error.js"
import User from "../../auth/entities/User.entity.js"

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

    async findMyEvents(userId: string) {
        const events = await this.eventRepository.findAll()
        return events.filter(event => event.owner.id === userId || event.organizers.some(organizer => organizer.id === userId))
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

    async create(event: Partial<Event>, user: User) {
        return await this.eventRepository.create({ ...event, owner: user, createdAt: new Date(), createdBy: user.username })
    }

    async update(id: string, event: Partial<Event>, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes editar este evento porque no eres el dueño o colaborador")
        return await this.eventRepository.update(id, { ...event, updatedAt: new Date(), updatedBy: user.username })
    }

    async delete(id: string, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes eliminar este evento porque no eres el dueño o colaborador")
        return await this.eventRepository.delete(id, user.username)
    }

    async assignParking(id: string, parkingId: string, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes asignar un parking a este evento porque no eres el dueño o colaborador")
        const existingParking = await this.parkingRepository.findById(parkingId)
        if (!existingParking) {
            throw new NotFoundError("El parking no existe")
        }
        return await this.eventRepository.update(id, { parkings: [...existingEvent.parkings, existingParking], updatedAt: new Date(), updatedBy: user.username })
    }

    async unassignParking(id: string, parkingId: string, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes desasignar un parking de este evento porque no eres el dueño o colaborador")
        const existingParking = await this.parkingRepository.findById(parkingId)
        if (!existingParking) {
            throw new NotFoundError("El parking no existe")
        }
        return await this.eventRepository.update(id, { parkings: existingEvent.parkings.filter(p => p.id !== parkingId), updatedAt: new Date(), updatedBy: user.username })
    }

    async assignOrganizer(id: string, organizerId: string, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes asignar un organizador a este evento porque no eres el dueño o colaborador")
        const existingOrganizer = await this.userRepository.findById(organizerId)
        if (!existingOrganizer) {
            throw new NotFoundError("El organizador no existe")
        }
        return await this.eventRepository.update(id, { organizers: [...existingEvent.organizers, existingOrganizer], updatedAt: new Date(), updatedBy: user.username })
    }

    async unassignOrganizer(id: string, organizerId: string, user: User) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("El evento no existe")
        }
        this._checkEventPermissions(existingEvent, user, "No puedes desasignar un organizador de este evento porque no eres el dueño o colaborador")
        const existingOrganizer = await this.userRepository.findById(organizerId)
        if (!existingOrganizer) {
            throw new NotFoundError("El organizador no existe")
        }
        return await this.eventRepository.update(id, { organizers: existingEvent.organizers.filter(o => o.id !== organizerId), updatedAt: new Date(), updatedBy: user.username })
    }

    private _checkEventPermissions(event: Event, user: User, message: string) {
        const isOwner = event.owner.id === user.id
        const isOrganizer = (event.organizers || []).some(organizer => organizer.id === user.id)

        if (!isOwner && !isOrganizer) {
            throw new ForbiddenError(message)
        }
    }

}
export default EventService