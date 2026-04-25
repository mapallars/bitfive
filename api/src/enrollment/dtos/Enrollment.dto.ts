import DTO from '../../core/orm/dto/Base.dto.js'
import Enrollment from '../entities/Enrollment.entity.js'

export class EnrollmentDTO extends DTO<Enrollment> {
    constructor(entity: Partial<Enrollment>) {
        super(entity)
    }
}

export default EnrollmentDTO
