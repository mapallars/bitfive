import { Entity, ManyToMany, Id, Column } from "../../core/orm/decorators/decorators.js"
import Event from "../../event/entities/Event.entity.js"


@Entity('Parkings')
export class Parking {

  @Id()
  id: string

  @Column({ type: 'string', nullable: false })
  name: string

  @Column({ type: 'string', nullable: true })
  description: string

  @Column({ type: 'string', nullable: true })
  type: string

  @Column({ type: 'string', nullable: false })
  location: string

  @Column({ type: 'number', nullable: false, default: 0 })
  capacity: number

  @Column({ type: 'boolean', nullable: false, default: true })
  isAvailable: boolean

  isActive: boolean

  isDeleted: boolean

  createdAt: Date

  createdBy: string

  updatedAt: Date

  updatedBy: string

  deletedAt: Date

  deletedBy: string

  @ManyToMany(() => Event, {
    joinTable: {
      name: "EventsParkings",
      joinColumn: "parkingId",
      inverseJoinColumn: "eventId"
    }
  })
  events: Event[]
}

export default Parking