import { Controller } from '../../core/decorators/controller.decorator.js'
import { Inject } from '../../core/decorators/inject.decorator.js'
import { Post } from '../../core/decorators/route.decorator.js'
import { Permissions } from '../../core/decorators/auth.decorator.js'
import Validator from '../../core/utils/Validator.js'
import { PERMISSIONS } from '../constants/authorities.js'
import CheckInService from '../services/CheckIn.service.js'
import EnrollmentDTO from '../dtos/Enrollment.dto.js'

@Controller('/checkIn')
export class CheckInController {

    constructor(
        @Inject(CheckInService)
        private checkInService: CheckInService,
    ) { }

    @Post('/')
    @Permissions([PERMISSIONS.ENROLLMENT.CHECK_IN])
    async checkIn(request, response) {
        const { enrollmentId, eventId } = request.body

        Validator.required({ enrollmentId, eventId })

        const enrollment = await this.checkInService.checkIn(enrollmentId, eventId)

        return response.status(200).json(new EnrollmentDTO(enrollment))
    }

}

export default CheckInController
