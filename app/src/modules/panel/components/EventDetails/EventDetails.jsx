import './EventDetails.css'
import Icon from '../../../../core/components/Icon/Icon'
import Button from '../../../../core/components/Button/Button'
import Divider from '../../../../core/components/Divider/Divider'
import StatusTag from '../../../../core/components/StatusTag/StatusTag'
import { EVENT } from '../../constants/event.constant.mjs'

const EventDetails = ({ event, onEdit, onDelete }) => {
    if (!event) return null

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date)
    }

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-CO', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date)
    }

    const getOptionLabel = (options, value) => {
        const option = options.find(opt => opt.value === value)
        return option ? option.key : value
    }

    return (
        <div className='lx-c-event-details'>
            <div className='lx-c-event-details-cover'>
                {event.cover ? (
                    <img src={event.cover} alt={event.name} />
                ) : (
                    <div className='lx-c-event-details-cover-placeholder' style={{ background: event.color || 'var(--lx-color-accent-dimed)' }} />
                )}
                <div className='lx-c-event-details-category'>
                    {event.category}
                </div>
            </div>

            <div className='lx-c-event-details-header'>
                <StatusTag status={event.isActive} message={event.isActive ? 'Activo' : 'Inactivo'} />
                <h1 className='lx-c-event-details-name'>{event.name}</h1>
                <div className='lx-c-event-details-quick-info'>
                    <div className='lx-c-event-details-info-item'>
                        <Icon name='calendar_today' size='s' />
                        {formatDate(event.startAt)}
                    </div>
                </div>
            </div>

            <div className='lx-c-event-details-grid'>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Hora de inicio</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='schedule' size='xs' /> {formatTime(event.startAt)}
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Hora de fin</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='schedule' size='xs' /> {formatTime(event.endAt)}
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Ubicación</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='location_on' size='xs' /> {event.location}
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Precio</div>
                    <div className='lx-c-event-details-grid-value lx-c-event-details-price'>
                        ${event.price}
                    </div>
                </div>
            </div>

            <Divider text='Descripción' />

            <div className='lx-c-event-details-section'>
                <p className='lx-c-event-details-description'>{event.description}</p>
            </div>

            <Divider text='Detalles adicionales' />

            <div className='lx-c-event-details-grid'>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Modalidad</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='info' size='xs' /> {getOptionLabel(EVENT.OPTIONS.TYPE, event.type)}
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Visibilidad</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='visibility' size='xs' /> {getOptionLabel(EVENT.OPTIONS.VISIBILITY, event.visibility)}
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Capacidad</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='group' size='xs' /> {event.maxCapacity} personas
                    </div>
                </div>
                <div className='lx-c-event-details-grid-item'>
                    <div className='lx-c-event-details-grid-label'>Parqueadero</div>
                    <div className='lx-c-event-details-grid-value'>
                        <Icon name='local_parking' size='xs' /> {event.hasParking ? 'Disponible' : 'No disponible'}
                    </div>
                </div>
            </div>

            <div className='lx-c-event-details-footer'>
                <div className='lx-c-event-details-metadata'>
                    <span>Creado por <b>{event.createdBy}</b> el {new Date(event.createdAt).toLocaleDateString()}</span>
                    {event.updatedBy && <span>Última actualización por <b>{event.updatedBy}</b> el {new Date(event.updatedAt).toLocaleDateString()}</span>}
                </div>

                <div className='lx-c-event-details-actions'>
                    <Button variant='bordered' color='auto' width='full' onClick={() => onEdit(event)}>
                        <Icon name='edit' /> Editar
                    </Button>
                    <Button variant='solid' color='danger' width='full' onClick={() => onDelete(event)}>
                        <Icon name='delete' /> Eliminar
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default EventDetails