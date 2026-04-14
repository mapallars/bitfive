import { Entity, Id, Column, ManyToOne } from "../../core/orm/decorators/decorators.js"
import User from "./User.entity.js"

@Entity('BlockedTokens')
export class BlockedToken {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    token: string

    @Column({ type: 'date' })
    expiration: Date

    @Column({ type: 'boolean', nullable: false, default: true })
    isActive: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    isDeleted: boolean

    @ManyToOne(() => User, {
        inverse: 'blockedTokens',
        joinColumn: 'userId',
        owner: true,
        eager: true
    })
    user: User

}

export default BlockedToken