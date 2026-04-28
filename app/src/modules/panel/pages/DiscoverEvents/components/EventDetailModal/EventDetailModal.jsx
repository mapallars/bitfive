import './EventDetailModal.css'
import { useAuth } from '../../../../../../core/contexts/AuthContext'
import Button from '../../../../../../core/components/Button/Button'
import Icon from '../../../../../../core/components/Icon/Icon'
import Modal from '../../../../../../core/components/Modal/Modal'
import DateFormat from '../../../../../../core/utils/dateFormat.mjs'
import EnrollmentRequester from '../../../../services/EnrollmentRequester.mjs'

const EventDetailModal = ({ event, onClose, onEnrollment }) => {
    const { user } = useAuth()

    if (!event) return null

    const {
        name = '-',
        description = '-',
        location = '-',
        owner = {},
        price = 0,
        modality = '-',
        maxCapacity = 0,
        parkingAvailable = false,
        startAt = new Date(),
        endAt = new Date(),
    } = event

    const isEnrolled = event.enrollments?.some(enrollment => enrollment.userId === user?.id && enrollment.enrollmentStatus === 'CONFIRMED')

    const enrollmentsCount = event.enrollments?.filter(enrollment => enrollment.enrollmentStatus === 'CONFIRMED').length ?? 0

    const availableSpots = maxCapacity - enrollmentsCount

    const handleEnrollClick = async () => {
        let _event = event
        let enrollment = _event.enrollments?.find(enrollment => enrollment.userId === user?.id && enrollment.enrollmentStatus === 'CONFIRMED')
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
        <Modal
            show={!!event}
            title={name}
            position='right'
            size='standar'
            onClose={onClose}
        >
            <div className='lx-c-event-detail-modal'>
                {/* Descripción */}
                <div className='lx-c-event-detail-section'>
                    <h3 className='lx-c-event-detail-section-title'>Descripción</h3>
                    <p className='lx-c-event-detail-description' style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
                </div>

                {/* Información General */}
                <div className='lx-c-event-detail-section'>
                    <h3 className='lx-c-event-detail-section-title'>Información General</h3>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='event' />
                            Fecha
                        </span>
                        <p className='lx-c-event-detail-value'>{DateFormat.date(startAt)}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='schedule' />
                            Hora de inicio
                        </span>
                        <p className='lx-c-event-detail-value'>{DateFormat.time(startAt)}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='schedule' />
                            Hora de finalización
                        </span>
                        <p className='lx-c-event-detail-value'>{DateFormat.time(endAt)}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='location_on' />
                            Ubicación
                        </span>
                        <p className='lx-c-event-detail-value'>{location}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='person' />
                            Organizador
                        </span>
                        <p className='lx-c-event-detail-value'>{owner?.name || '-'}</p>
                    </div>
                </div>

                {/* Detalles de Precios y Capacidad */}
                <div className='lx-c-event-detail-section'>
                    <h3 className='lx-c-event-detail-section-title'>Detalles del Evento</h3>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='attach_money' />
                            Precio
                        </span>
                        <p className='lx-c-event-detail-value'>
                            ${price.toLocaleString('es-MX')}
                        </p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='two_wheeler' />
                            Modalidad
                        </span>
                        <p className='lx-c-event-detail-value'>{modality}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='people' />
                            Capacidad Máxima
                        </span>
                        <p className='lx-c-event-detail-value'>{maxCapacity} personas</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='person_add' />
                            Personas Inscritas
                        </span>
                        <p className='lx-c-event-detail-value'>{enrollmentsCount} de {maxCapacity}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='local_parking' />
                            Parqueadero
                        </span>
                        <p className={`lx-c-event-detail-value ${parkingAvailable ? '--available' : '--unavailable'}`}>
                            {parkingAvailable ? 'Disponible' : 'No disponible'}
                        </p>
                    </div>
                </div>

                {/* Disponibilidad */}
                <div className='lx-c-event-detail-section'>
                    <div className='lx-c-event-detail-availability'>
                        <div className='lx-c-event-detail-availability-info'>
                            <p className='lx-c-event-detail-availability-label'>Espacios disponibles</p>
                            <p className='lx-c-event-detail-availability-value'>{availableSpots}/{maxCapacity}</p>
                        </div>
                        <div className='lx-c-event-detail-availability-bar'>
                            <div
                                className='lx-c-event-detail-availability-fill'
                                style={{
                                    width: `${(enrollmentsCount / maxCapacity) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Botón de Acción */}
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
            </div>
        </Modal>
    )
}

export default EventDetailModal
