import { Service } from "../../core/decorators/service.decorator.js";
import EventRepository from "../repositories/Event.repository.js";
import Event from "../entities/Event.entity.js";
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import { Inject } from "../../core/decorators/inject.decorator.js";
@Service()
export class EventService {

    constructor(
        @Inject(EventRepository)
        private eventRepository: EventRepository
    ) { }

    async findAll() {
        return await this.eventRepository.findAll()
    }

    async findById(id: string) {
        const event = await this.eventRepository.findById(id)
        if (!event) {
            throw new NotFoundError("Event not found")
        }
        return event
    }

    async findByName(name: string) {
        const event = await this.eventRepository.findOneBy('name', name)
        if (!event) {
            throw new NotFoundError("Event not found")
        }
        return event
    }

    async create(event: Partial<Event>) {
        return await this.eventRepository.create(event)
    }

    async update(id: string, event: Partial<Event>) {
        const existingEvent = await this.eventRepository.findById(id)   
        if (!existingEvent) {
            throw new NotFoundError("Event not found")
        }
        return await this.eventRepository.update(id, event)
    }

    async delete(id: string) {
        const existingEvent = await this.eventRepository.findById(id)
        if (!existingEvent) {
            throw new NotFoundError("Event not found")
        }
        return await this.eventRepository.delete(id)
    }

}
export default EventService