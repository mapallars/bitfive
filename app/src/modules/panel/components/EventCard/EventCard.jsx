import './EventCard.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'

const EventCard = ({ event, onDelete = () => { }, onEdit = () => { }, onView = () => { } }) => {

    const {
        name = '',
        location = 'Sin ubicación',
        color,
        isActive,
        startAt,
    } = event

    const icons = { Admin: 'manage_accounts', Event: 'person_check', Guest: 'person', Veterinarian: 'person_heart', Operator: 'person_apron' }

    return (<div className={`lx-c-event-card --${isActive ? 'active' : 'inactive'}`} onClick={() => onView(event)} style={{ '--lx-c-event-card-color': color }}>
        <div className='lx-c-event-card-head'>
            <div className='lx-c-event-card-cover'>
                {name}
            </div>
        </div>
        <div className='lx-c-event-card-content'>

            <div className='lx-c-event-card-summary'>
                <div className='lx-c-event-card-date'>
                    {new Date(startAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>

                <div className='lx-c-event-card-name'>{name}</div>

                <div className='lx-c-event-card-location'>
                    {location}
                </div>
            </div>

            <div className='footer'>
                <Button size='s' color='auto' width='full' onClick={() => onView(event)}><Icon name='visibility' /> Detalles</Button>
                <Button size='s' color='auto' width='full' variant='bordered' icon onClick={() => onEdit(event)}><Icon name='edit' /></Button>
                <Button size='s' color='danger' variant='dimed' icon onClick={() => onDelete(event)}><Icon name='delete' /></Button>
            </div>
        </div>
    </div>)
}

export default EventCard