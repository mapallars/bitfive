import DTO from "../../core/orm/dto/Base.dto.js"
import Slot from "../entities/Slot.entity.js"

export class SlotDTO extends DTO<Slot> {
    constructor(entity: Partial<Slot>) {
        super(entity)
    }
}

export default SlotDTO
