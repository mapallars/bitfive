import { Column } from "../../core/orm/decorators/column.decorator.js"
import { ManyToOne, OneToMany } from "../../core/orm/decorators/decorators.js"
import { Entity } from "../../core/orm/decorators/entity.decorator.js"
import { Id } from "../../core/orm/decorators/id.decorator.js"
import Event from "./Event.entity.js"

@Entity('parkings')
export class Parking {

  @Id()
  id: string

  @Column({ type: 'string', nullable: false })
  slotCode: string

  @Column({ type: 'boolean', nullable: false, default: true })
  isAvailable: boolean

  status: string

  isActive: boolean

  isDeleted: boolean

  createdAt: Date

  createdBy: string

  updatedAt: Date

  updatedBy: string

  deletedAt: Date

  deletedBy: string

  @OneToMany(() => Event, 'parkingId')
  events: Event[]
}

export default Parking