import './AvailableEvents.css'
import AvailableEventCard from './AvailableEventCard'
import Empity from '../../../../../../core/components/Empity/Empity'

const AvailableEvents = ({ events = [], onEventSelect = () => {} }) => {
    const count = events.length || 0
    
    // Filtrar solo eventos sin fecha específica (disponibles)
    const availableEvents = events.filter(e => e && e.name)

    return (
        <div className='lx-c-available-events'>
            {count > 0 ? (
                <div className='lx-c-available-events-table'>
                    <div className='lx-c-available-events-header'>
                        <div className='lx-c-available-events-col --name'>Evento</div>
                        <div className='lx-c-available-events-col --location'>Ubicación</div>
                        <div className='lx-c-available-events-col --organizer'>Organizador</div>
                        <div className='lx-c-available-events-col --date'>Fecha</div>
                    </div>
                    <div className='lx-c-available-events-content'>
                        {availableEvents.map(event => (
                            <AvailableEventCard 
                                key={event.id} 
                                event={event}
                                onSelect={() => onEventSelect(event)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <Empity icon='event' message='No hay eventos disponibles en este momento' />
            )}
        </div>
    )
}

export default AvailableEvents
