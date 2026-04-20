import User from "../../auth/entities/User.entity.js"
import Parking from "../../parking/entities/Parking.entity.js"
import { Entity, Id, Column, ManyToMany } from "../../core/orm/decorators/decorators.js"

@Entity('Events')
export class Event {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    name: string

    @Column({ type: 'string' })
    description: string

    @Column({ type: 'string' })
    category: string

    @Column({ type: 'string' })
    cover: string

    @Column({ type: 'string' })
    color: string

    @Column({ type: 'string', nullable: false })
    location: string

    @Column({ type: 'date', nullable: false })
    startAt: Date

    @Column({ type: 'date', nullable: false })
    endAt: Date

    @Column({ type: 'string', nullable: false })
    timezone: string

    @Column({ type: 'string' })
    type: string

    @Column({ type: 'string' })
    visibility: string

    @Column({ type: 'string', default: 'AVAILABLE' })
    eventStatus: string

    @Column({ type: 'number' })
    maxCapacity: number

    @Column({ type: 'boolean', default: false })
    hasParking: boolean

    @Column({ type: 'number', default: 0 })
    price: number

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

    @ManyToMany(() => Parking, {
        joinTable: {
            name: "EventsParkings",
            joinColumn: "eventId",
            inverseJoinColumn: "parkingId"
        },
        owner: true,
        eager: true
    })
    parkings: Parking[]

}

export default Event