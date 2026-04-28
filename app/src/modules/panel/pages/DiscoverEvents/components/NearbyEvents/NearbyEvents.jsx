import './NearbyEvents.css'
import NearbyEventCard from './NearbyEventCard'
import Empity from '../../../../../../core/components/Empity/Empity'

const NearbyEvents = ({ events = [], onEventSelect = () => {} }) => {
    const count = events.length || 0

    // Obtener los 8 eventos más próximos y agruparlos por fecha
    const getUpcomingEvents = () => {
        const now = new Date()
        
        return events
            .filter(event => event && event.startAt && new Date(event.startAt) >= now)
            .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
            .slice(0, 8)
    }

    // Agrupar eventos por fecha
    const groupEventsByDate = (events) => {
        const grouped = {}
        
        events.forEach(event => {
            const date = new Date(event.startAt)
            const dateKey = date.toDateString()
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: date,
                    events: []
                }
            }
            
            grouped[dateKey].events.push(event)
        })
        
        return Object.values(grouped).sort((a, b) => a.date - b.date)
    }

    const upcomingEvents = getUpcomingEvents()
    const groupedEvents = groupEventsByDate(upcomingEvents)

    return (
        <div className='lx-c-nearby-events'>
            {groupedEvents.length > 0 ? (
                <div className='lx-c-nearby-events-timeline'>
                    {groupedEvents.map((dateGroup, dateIndex) => (
                        <div key={dateGroup.date.toISOString()} className='lx-c-nearby-events-date-group'>
                            {/* Nodo de fecha */}
                            <div className='lx-c-nearby-events-date-node'>
                                <div className='lx-c-nearby-events-date-circle'>
                                    <span className='lx-c-nearby-events-date-number'>
                                        {dateGroup.date.getDate()}
                                    </span>
                                </div>
                                <div className='lx-c-nearby-events-date-info'>
                                    <div className='lx-c-nearby-events-date-day'>
                                        {dateGroup.date.toLocaleDateString('es-MX', { weekday: 'long' })}
                                    </div>
                                    <div className='lx-c-nearby-events-date-month'>
                                        {dateGroup.date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Eventos de esta fecha */}
                            <div className='lx-c-nearby-events-date-events'>
                                {dateGroup.events.map((event, eventIndex) => (
                                    <NearbyEventCard 
                                        key={event.id} 
                                        event={event}
                                        dateIndex={dateIndex}
                                        eventIndex={eventIndex}
                                        totalInDate={dateGroup.events.length}
                                        onSelect={() => onEventSelect(event)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Empity icon='event' message='No hay eventos próximos disponibles' />
            )}
        </div>
    )
}

export default NearbyEvents
