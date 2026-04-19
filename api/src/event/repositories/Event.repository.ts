import { Repository } from "../../core/decorators/repository.decorator.js"
import BaseRepository from "../../core/orm/repository/Base.repository.js"
import Event from "../entities/Event.entity.js"

@Repository()
export class EventRepository extends BaseRepository<Event> {
    constructor() {
        super(Event)
    }
}

export default EventRepository