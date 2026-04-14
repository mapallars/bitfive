import { Entity, Id, Column, ManyToMany } from "../../core/orm/decorators/decorators.js"
import Role from "./Role.entity.js"

@Entity('Permissions')
export class Permission {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    name: string

    @Column({ type: 'string', nullable: false })
    alias: string

    @Column({ type: 'string', nullable: true })
    description: string

    @Column({ type: 'string', nullable: true, default: 'Access' })
    type: string

    @Column({ type: 'boolean', nullable: false, default: true })
    isActive: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    isDeleted: boolean

    @ManyToMany(() => Role, {
        joinTable: {
            name: "RolesPermissions",
            joinColumn: "permissionId",
            inverseJoinColumn: "roleId"
        }
    })
    roles: Role[]

}

export default Permission