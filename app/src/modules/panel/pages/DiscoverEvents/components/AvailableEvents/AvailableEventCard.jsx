import Button from '../../../../../../core/components/Button/Button'
import Icon from '../../../../../../core/components/Icon/Icon'
import './AvailableEventCard.css'

const AvailableEventCard = ({ event, onSelect }) => {
    const {
        name = '-',
        location = '-',
        owner = {},
        startAt = new Date()
    } = event

    const formatDate = (date) => {
        return new Date(date).toLocaleString('es-MX', { 
            dateStyle: 'short',
            timeStyle: 'short'
        })
    }

    return (
        <div className='lx-c-available-event-card'>
            <div className='lx-c-available-event-card-col --name'>
                <span className='lx-c-available-event-card-label'>Evento</span>
                <p className='lx-c-available-event-card-value'>{name}</p>
            </div>
            <div className='lx-c-available-event-card-col --location'>
                <span className='lx-c-available-event-card-label'>Ubicación</span>
                <p className='lx-c-available-event-card-value'>{location}</p>
            </div>
            <div className='lx-c-available-event-card-col --organizer'>
                <span className='lx-c-available-event-card-label'>Organizador</span>
                <p className='lx-c-available-event-card-value'>{owner?.name || '-'}</p>
            </div>
            <div className='lx-c-available-event-card-col --date'>
                <span className='lx-c-available-event-card-label'>Fecha</span>
                <p className='lx-c-available-event-card-value'>{formatDate(startAt)}</p>
            </div>
            <div className='lx-c-available-event-card-col --actions'>
                <Button
                    size='s' 
                    color='accent'
                    onClick={onSelect}
                    width='fit'
                >
                    <Icon name='arrow_forward' />
                    Ver detalles
                </Button>
            </div>
        </div>
    )
}

export default AvailableEventCard
