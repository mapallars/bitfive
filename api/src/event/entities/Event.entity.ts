import User from "../../auth/entities/User.entity.js"
import { Entity, Id, Column, ManyToMany } from "../../core/orm/decorators/decorators.js"

@Entity('Events')
export class Event {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    name: string

    @Column({ type: 'string' })
    description: string

    @Column({ type: 'date', nullable: false })
    date: Date

    @Column({ type: 'string', nullable: false })
    dateTime: Date

    @Column({ type: 'boolean', default: false })
    eventStatus: boolean

    @Column({ type: 'number' })
    maxCapacity: number

    @Column({ type: 'boolean', default: false })
    hasParking: boolean

    @Column({ type: 'boolean', default: false })
    parkingSlots: boolean

    isActive: boolean

    isDeleted: boolean

    createdAt: Date

    createdBy: string

    updatedAt: Date

    updatedBy: string

    deletedAt: Date

    deletedBy: string

    @ManyToMany(() => User, {
        joinTable: {
            name: "UsersEvents",
            joinColumn: "eventId",
            inverseJoinColumn: "userId"
        },
        owner: true,
        eager: true
    })
    organizers: User[]

}

export default Event