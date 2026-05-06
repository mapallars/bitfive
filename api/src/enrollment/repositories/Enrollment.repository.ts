import { Repository } from '../../core/decorators/decorators.js'
import BaseRepository from '../../core/orm/repository/Base.repository.js'
import Enrollment from '../entities/Enrollment.entity.js'

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

    // Devuelve las inscripciones de un evento con el email y nombre del usuario, necesario para enviar notificaciones de cambio de evento.
    async findManyByEventIdWithUsers(eventId: string): Promise<Array<{
        id: string
        enrollmentStatus: string
        userEmail: string
        userName: string
    }>> {
        return this.raw(`
            SELECT e.id, e."enrollmentStatus", u.email AS "userEmail", u.username AS "userName"
            FROM "Enrollments" e
            INNER JOIN "Users" u ON u.id = e."userId"
            WHERE e."eventId" = $1
              AND e."isActive" = true
              AND e."isDeleted" = false
        `, [eventId])
    }


    // Resumen de asistencia para un evento: totales por estado.

    async findAttendanceReport(eventId: string): Promise<{
        total: number
        checkedIn: number
        pending: number
        cancelled: number
    }> {
        const rows = await this.raw(`
            SELECT
                COUNT(*)                                                        AS total,
                COUNT(*) FILTER (WHERE "enrollmentStatus" = 'CHECKED_IN')     AS "checkedIn",
                COUNT(*) FILTER (WHERE "enrollmentStatus" = 'ACTIVE')         AS pending,
                COUNT(*) FILTER (WHERE "enrollmentStatus" = 'CANCELLED')      AS cancelled
            FROM "Enrollments"
            WHERE "eventId" = $1
              AND "isDeleted" = false
        `, [eventId])

        const row = rows[0] ?? { total: 0, checkedIn: 0, pending: 0, cancelled: 0 }
        return {
            total: Number(row.total),
            checkedIn: Number(row.checkedIn),
            pending: Number(row.pending),
            cancelled: Number(row.cancelled),
        }
    }

}

export default EnrollmentRepository