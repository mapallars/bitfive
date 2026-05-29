import './TimelineEventCard.css'
import Icon from '../../../../core/components/Icon/Icon'
import StatusTag from '../../../../core/components/StatusTag/StatusTag'
import Constant from '../../constants/constant.mjs'
import { EVENT } from '../../constants/event.constant.mjs'

const TimelineEventCard = ({ event, onClick }) => {
    const startTime = new Date(event.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const endTime = new Date(event.endAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    const statusMessages = {
        PENDING: 'Pendiente',
        CANCELLED: 'Cancelada',
        CONFIRMED: 'Confirmada'
    }

    return (
        <div className='lx-c-timeline-event-card' onClick={onClick} style={{ '--lx-c-timeline-event-card-color': event.color }}>
            <div className='lx-c-timeline-event-card-header'>
                <p className='lx-c-timeline-event-card-time'>{startTime}</p>
                <p className='lx-c-timeline-event-card-end-time'>a {endTime}</p>
            </div>

            <h2 className='lx-c-timeline-event-card-title'>{event.name}</h2>
            <p className='lx-c-timeline-event-card-description'>{event.description}</p>

            <div className='lx-c-timeline-event-card-tags'>
                <span className='lx-c-timeline-event-card-tag'>
                    <Icon name='co_present' size='s' />
                    {Constant.fromValue(EVENT.OPTIONS.TYPE, event.type) || 'Sin tipo'}
                </span>
                <span className='lx-c-timeline-event-card-tag'>
                    <Icon name='tag' size='s' />
                    {event.category || 'Sin categoría'}
                </span>
                {event.enrollmentStatus && (
                    <span className='lx-c-timeline-event-card-tag'>
                        <StatusTag status={true} message={statusMessages[event.enrollmentStatus] || event.enrollmentStatus} />
                    </span>
                )}
            </div>

            <div className='lx-c-timeline-event-card-details'>
                <div className='lx-c-timeline-event-card-detail-item'>
                    <Icon name='location_on' size='s' />
                    <p>{event.location || 'Sin ubicación'}</p>
                </div>
                <div className='lx-c-timeline-event-card-detail-item'>
                    <Icon name='event_seat' size='s' />
                    <p>{event.maxCapacity} lugares</p>
                </div>
                <div className='lx-c-timeline-event-card-detail-item'>
                    <Icon name='attach_money' size='s' />
                    <p>{(event.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                </div>
            </div>
        </div>
    )
}

export default TimelineEventCard