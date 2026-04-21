import { Repository } from "../../core/decorators/decorators.js"
import BaseRepository from "../../core/orm/repository/Base.repository.js"
import Slot from "../entities/Slot.entity.js"

@Repository()
export class SlotRepository extends BaseRepository<Slot> {

    constructor() {
        super(Slot)
    }

    async occupyById(id: string): Promise<Slot | null> {
        const rows = await this.raw(
            `UPDATE "Slots"
             SET "isOccupied" = TRUE, "updatedAt" = NOW()
             WHERE id = $1 AND "isOccupied" = FALSE AND "isDeleted" = FALSE
             RETURNING *`,
            [id]
        )
        return rows[0] ?? null
    }

    async freeById(id: string): Promise<Slot | null> {
        const rows = await this.raw(
            `UPDATE "Slots"
             SET "isOccupied" = FALSE, "updatedAt" = NOW()
             WHERE id = $1 AND "isOccupied" = TRUE AND "isDeleted" = FALSE
             RETURNING *`,
            [id]
        )
        return rows[0] ?? null
    }

}

export default SlotRepository
