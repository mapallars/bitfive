import { Entity, Id, Column, ManyToOne } from '../../core/orm/decorators/decorators.js'
import Parking from './Parking.entity.js'


@Entity('Slots')
export class Slot {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    code: string

    @Column({ type: 'boolean', nullable: false, default: false })
    isOccupied: boolean

    isActive: boolean

    isDeleted: boolean

    createdAt: Date

    createdBy: string

    updatedAt: Date

    updatedBy: string

    deletedAt: Date

    deletedBy: string

    @ManyToOne(() => Parking, {
        inverse: 'parkingId',
        joinColumn: 'parkingId',
        owner: true,
        eager: false
    })
    parking: any
}

export default Slot
