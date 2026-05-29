import './EventCard.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import DateFormat from '../../../../core/utils/dateFormat.mjs'

const EventCard = ({ event, onDelete = () => { }, onEdit = () => { }, onView = () => { }, disableActions }) => {

    const {
        name = '',
        price,
        location = 'Sin ubicación',
        color,
        isActive,
        startAt,
        endAt
    } = event

    return (<div className={`lx-c-event-card --${isActive ? 'active' : 'inactive'}`} onClick={() => onView(event)} style={{ '--lx-c-event-card-color': color }}>
        <div className='lx-c-event-card-head'>
            <div className='lx-c-event-card-cover'>
                {name}
            </div>
        </div>
        <div className='lx-c-event-card-content'>

            <div className='lx-c-event-card-summary'>
                <div className='lx-c-event-card-price'>{price ? <span className='--price'>{price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} COP</span> : <span className='--free'>Gratis</span>}</div>
                <div className='lx-c-event-card-name'>{name}</div>
                <div className='lx-c-event-card-location'>{location}</div>
            </div>

            <div className='lx-c-event-card-dates'>
                {startAt ? <div className='--start'>
                    <p className='--label'>Inicio</p>
                    <p className='--date'>{DateFormat.short(startAt)}</p>
                    <p className='--time'>{DateFormat.time(startAt)}</p>
                </div> : <div className='--start'>
                    <p className='--label'>Inicio</p>
                    <p className='--date'>Indefinido</p>
                </div>}
                <div className='--icon'>
                    <Icon name='event_upcoming' size='s' />
                </div>
                {endAt ? <div className='--end'>
                    <p className='--label'>Fin</p>
                    <p className='--date'>{DateFormat.short(endAt)}</p>
                    <p className='--time'>{DateFormat.time(endAt)}</p>
                </div> : <div className='--end'>
                    <p className='--label'>Fin</p>
                    <p className='--date'>Indefinido</p>
                </div>}
            </div>

            <div className='footer'>
                <Button size='s' color='auto' width='full' onClick={() => onView(event)}><Icon name='visibility' /> Detalles</Button>
                {!disableActions && <>
                    <Button size='s' color='auto' width='full' variant='bordered' icon onClick={() => onEdit(event)}><Icon name='edit' /></Button>
                    <Button size='s' color='danger' variant='dimed' icon onClick={() => onDelete(event)}><Icon name='delete' /></Button>
                </>}
            </div>
        </div>
    </div>)
}

export default EventCard