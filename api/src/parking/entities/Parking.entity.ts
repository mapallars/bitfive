import { Column } from "../../core/orm/decorators/column.decorator.js"
import { ManyToOne } from "../../core/orm/decorators/decorators.js"
import { Entity } from "../../core/orm/decorators/entity.decorator.js"
import { Id } from "../../core/orm/decorators/id.decorator.js"
import Event from "../../event/entitys/Event.entity.js"


@Entity('parkings')
export class Parking {

  @Id()
  id: string

  @Column({ type: 'string', nullable: false })
  eventId: string

  @Column({ type: 'string' })
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

  @ManyToOne(() => Event, { joinColumn: 'eventId', eager: true })
  event: Event
}

export default Parking