import './EventCards.css'
import EventCard from '../EventCard/EventCard.jsx'
import Empity from '../../../../core/components/Empity/Empity'

const EventCards = ({ events = [], onDelete = () => { }, onEdit = () => { }, onView = () => { } }) => {
    const count = events.length || 0

    return (<div className='lx-c-events'>
        {count > 0
            ? <div className='lx-c-events-content'>
                {events.map(event => <EventCard key={event.id} event={event} onDelete={onDelete} onEdit={onEdit} onView={onView} />)}
            </div>
            : <Empity icon='event' message='No hay eventos registrados en el sistema' />
        }
    </div>)
}

export default EventCards