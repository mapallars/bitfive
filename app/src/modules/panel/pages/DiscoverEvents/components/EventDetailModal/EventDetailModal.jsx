import './EventDetailModal.css'
import { useAuth } from '../../../../../../core/contexts/AuthContext'
import Button from '../../../../../../core/components/Button/Button'
import Icon from '../../../../../../core/components/Icon/Icon'
import EnrollmentRequester from '../../../../services/EnrollmentRequester.mjs'
import Details from '../../../../components/EventDetails/Details'

const EventDetailModal = ({ event, onEnrollment }) => {
    const { user } = useAuth()

    if (!event) return null

    const isEnrolled = event.enrollments?.some(enrollment => enrollment.userId === user?.id && ['CONFIRMED', 'PENDING'].includes(enrollment.enrollmentStatus))

    const handleEnrollClick = async () => {
        let _event = event
        let enrollment = _event.enrollments?.find(enrollment => enrollment.userId === user?.id && ['CONFIRMED', 'PENDING'].includes(enrollment.enrollmentStatus))
        if (isEnrolled) {
            enrollment = await EnrollmentRequester.cancelEnrollment(enrollment)
            _event.enrollments = [...event.enrollments.filter(e => e.id !== enrollment.id), { ...enrollment }]
        } else {
            enrollment = await EnrollmentRequester.createEnrollment(event)
            _event.enrollments = [...event.enrollments, enrollment]
        }
        onEnrollment(_event)
    }

    return (
        <>
            <div className='lx-c-event-detail-modal'>
                <Details
                    event={event}
                    enrollment={
                        <div className='lx-c-event-detail-section'>
                            <Button
                                color={isEnrolled ? 'danger' : 'accent'}
                                onClick={handleEnrollClick}
                                width='full'
                            >
                                <Icon name={isEnrolled ? 'close' : 'check'} />
                                {isEnrolled ? 'Cancelar Inscripción' : 'Inscribirse'}
                            </Button>
                        </div>
                    }
                />
            </div>
        </>
    )
}

export default EventDetailModal
