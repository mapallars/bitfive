import User from "../../auth/entities/User.entity.js";
import Event from "../../event/entities/Event.entity.js";
import { Column } from "../../core/orm/decorators/column.decorator.js";
import { ManyToOne } from "../../core/orm/decorators/decorators.js";
import { Entity } from "../../core/orm/decorators/entity.decorator.js";
import { Id } from "../../core/orm/decorators/id.decorator.js";


@Entity('Enrollments')
export class Enrollment {

    @Id()
    id: string

    @Column({type: 'date' , nullable: false , default: 'NOW()' })
    date: Date

    @Column({type: 'string', nullable: false })
    enrollmentStatus : string

    status: string

    isActive: boolean

    isDeleted: boolean

    createdAt: Date

    createdBy: string

    updatedAt: Date

    updatedBy: string

    deletedAt: Date

    deletedBy: string

    @ManyToOne(() => User, {
        inverse: 'enrollments',
        joinColumn: 'userId',
        owner: true,
        eager: false
    })
    user: any

    @ManyToOne(() => Event, {
        inverse: 'enrollments',
        joinColumn: 'eventId',
        owner: true,
        eager: false
    })
    event: any
    
}

export default Enrollment