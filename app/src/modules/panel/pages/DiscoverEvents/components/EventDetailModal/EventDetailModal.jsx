import Button from '../../../../../../core/components/Button/Button'
import Icon from '../../../../../../core/components/Icon/Icon'
import Modal from '../../../../../../core/components/Modal/Modal'
import './EventDetailModal.css'

const EventDetailModal = ({ event, onClose, onEnroll, onUnenroll }) => {
    if (!event) return null

    const {
        name = '-',
        description = '-',
        location = '-',
        owner = {},
        price = 0,
        modality = '-',
        maxCapacity = 0,
        attendeesCount = 0,
        parkingAvailable = false,
        startAt = new Date(),
        endAt = new Date(),
        isEnrolled = false
    } = event

    const formatDate = (date) => {
        return new Date(date).toLocaleString('es-MX', { 
            dateStyle: 'long'
        })
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleString('es-MX', { 
            timeStyle: 'short'
        })
    }

    const availableSpots = maxCapacity - attendeesCount

    const handleEnrollClick = () => {
        if (isEnrolled) {
            onUnenroll?.(event)
        } else {
            onEnroll?.(event)
        }
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
                    <p className='lx-c-event-detail-description'>{description}</p>
                </div>

                {/* Información General */}
                <div className='lx-c-event-detail-section'>
                    <h3 className='lx-c-event-detail-section-title'>Información General</h3>
                    
                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='event' />
                            Fecha
                        </span>
                        <p className='lx-c-event-detail-value'>{formatDate(startAt)}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='schedule' />
                            Hora de inicio
                        </span>
                        <p className='lx-c-event-detail-value'>{formatTime(startAt)}</p>
                    </div>

                    <div className='lx-c-event-detail-row'>
                        <span className='lx-c-event-detail-label'>
                            <Icon name='schedule' />
                            Hora de finalización
                        </span>
                        <p className='lx-c-event-detail-value'>{formatTime(endAt)}</p>
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
                        <p className='lx-c-event-detail-value'>{attendeesCount} de {maxCapacity}</p>
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
                                    width: `${(attendeesCount / maxCapacity) * 100}%`
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
                        size='l'
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
