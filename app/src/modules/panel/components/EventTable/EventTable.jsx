import './EventTable.css'
import Table from "../../../../core/components/Table/Table"
import Icon from '../../../../core/components/Icon/Icon'
import Button from '../../../../core/components/Button/Button'

const EventTable = ({ events, onView = () => { }, onEdit = () => { }, onDelete = () => { } }) => {
    return <Table
        objects={events}
        mapper={(event) => ({
            startAt: <div className='lx-t-events-date' style={{ '--lx-t-events-color': event.color }}>
                <div className='--month'>{new Date(event.startAt).toLocaleString('es-CO', { month: 'short' })}</div>
                <div className='--day'>{new Date(event.startAt).getDate()}</div>
            </div>,
            name: <div className='lx-t-events-title'>
                <div>
                    <p className='lx-t-events-name'>{event.name}</p>
                    <p className='lx-t-events-description'>{event.description}</p>
                </div>
                <div className='lx-t-events-tags'>

                    <span className='--tag'>
                        <Icon name='co_present' size='s' />
                        {event.type || 'Sin tipo'}
                    </span>
                    <span className='--tag'>
                        <Icon name='lock' size='s' />
                        {event.visibility || 'Sin visibilidad'}
                    </span>
                    <span className='--tag'>
                        <Icon name='tag' size='s' />
                        {event.category || 'Sin categoría'}
                    </span>
                </div>
            </div>,
            price: <center className='lx-text-color-gray'>{(event.price || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })} COP</center>,
            maxCapacity: <center className='lx-t-events-capacity'><Icon name='event_seat' />{event.maxCapacity}</center>,
            location: <div className='lx-t-events-location'>
                <div className='--location'>
                    <Icon name='location_on' />
                    <p>{event.location || 'Sin ubicación'}</p>
                </div>
            </div>,
            '': <div className='lx-t-events-actions'>
                <Button color='auto' variant='bordered' size='s' icon onClick={() => onEdit(event)}>
                    <Icon name='edit' />
                </Button>
                <Button color='danger' variant='dimed' size='s' icon onClick={() => onDelete(event)}>
                    <Icon name='delete' />
                </Button>
            </div>
        })}
        translation={{
            name: 'Nombre',
            type: 'Tipo',
            category: 'Categoría',
            location: 'Ubicación',
            startAt: 'Inicia',
            endAt: 'Termina',
            maxCapacity: 'Capacidad',
            price: 'Precio'
        }}
        sort={['price', 'location', 'startAt', 'name', 'maxCapacity']}
        filters={['type', 'category']}
        selectionable={false}
        onClick={(event) => onView(event)}
    />
}

export default EventTable