import DTO from "../../core/orm/dto/Base.dto.js"
import Event from "../entities/Event.entity.js"

export class EventDTO extends DTO<Event> {
    constructor(entity: Partial<Event>) {
        super(entity)
    }
}

export default EventDTO