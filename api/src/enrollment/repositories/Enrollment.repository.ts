import { Repository } from "../../core/decorators/decorators.js"
import BaseRepository from "../../core/orm/repository/Base.repository.js"
import Enrollment from "../entities/Enrollment.entity.js"

@Repository()
export class EnrollmentRepository extends BaseRepository<Enrollment> {

    constructor() {
        super(Enrollment)
    }

    async findManyByEventId(eventId: string) {
        return this.raw(`
            SELECT * 
            FROM "Enrollments" 
            WHERE "eventId" = $1 AND "isActive" = true AND "isDeleted" = false
            `,
            [eventId]
        )
    }

    async findManyByUserId(userId: string) {
        return this.raw(`
            SELECT * 
            FROM "Enrollments" 
            WHERE "userId" = $1 AND "isActive" = true AND "isDeleted" = false`,
            [userId]
        )
    }

}

export default EnrollmentRepository