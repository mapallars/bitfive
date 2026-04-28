import Button from "../../../../../../core/components/Button/Button"
import Icon from "../../../../../../core/components/Icon/Icon"

const NearbyEventCard = ({ event, dateIndex, eventIndex, totalInDate, onSelect }) => {
    const {
        name = '-',
        location = '-',
        owner = {},
        assistantsCount = 0,
        startAt = new Date()
    } = event

    const formatDate = (date) => {
        return new Date(date).toLocaleString('es-MX', { 
            dateStyle: 'short'
        })
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleString('es-MX', { 
            timeStyle: 'short'
        })
    }

    const isLastEventInDate = eventIndex === totalInDate - 1

    return (
        <div className='lx-c-nearby-event-card-wrapper'>
            <div className='lx-c-nearby-event-card'>
                <div className='lx-c-nearby-event-card-header'>
                    <h3 className='lx-c-nearby-event-card-name'>{name}</h3>
                </div>
                
                <div className='lx-c-nearby-event-card-body'>
                    <div className='lx-c-nearby-event-card-row'>
                        <span className='lx-c-nearby-event-card-label'>
                            <Icon name='person' />
                            Organizador
                        </span>
                        <p className='lx-c-nearby-event-card-value'>{owner?.name || '-'}</p>
                    </div>

                    <div className='lx-c-nearby-event-card-row'>
                        <span className='lx-c-nearby-event-card-label'>
                            <Icon name='location_on' />
                            Ubicación
                        </span>
                        <p className='lx-c-nearby-event-card-value'>{location}</p>
                    </div>

                    <div className='lx-c-nearby-event-card-row'>
                        <span className='lx-c-nearby-event-card-label'>
                            <Icon name='schedule' />
                            Hora
                        </span>
                        <p className='lx-c-nearby-event-card-value'>
                            {formatTime(startAt)}
                        </p>
                    </div>

                    <div className='lx-c-nearby-event-card-row'>
                        <span className='lx-c-nearby-event-card-label'>
                            <Icon name='people' />
                            Asistentes
                        </span>
                        <p className='lx-c-nearby-event-card-value'>{assistantsCount} personas</p>
                    </div>
                </div>

                <div className='lx-c-nearby-event-card-footer'>
                    <Button
                        size='m'
                        color='accent'
                        onClick={onSelect}
                        width='fit'
                    >
                        <Icon name='arrow_forward' />
                        Ver detalles
                    </Button>
                </div>
            </div>
            
            {!isLastEventInDate && <div className='lx-c-nearby-event-card-connector' />}
        </div>
    )
}

export default NearbyEventCard
