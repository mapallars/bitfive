import './Events.css'
import { useState, useEffect, useCallback } from 'react'
import { useSync } from '../../../../core/hooks/useSync'
import { useLoad } from '../../../../core/hooks/useLoad'
import EventRequester from '../../services/EventRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import TabGroup from '../../../../core/components/TabGroup/TabGroup'
import Icon from '../../../../core/components/Icon/Icon'
import Button from '../../../../core/components/Button/Button.jsx'
import EventCards from '../../components/EventCards/EventCards.jsx'
import EventTable from '../../components/EventTable/EventTable.jsx'
import Footer from '../../../../core/components/Footer/Footer'
import Modal from '../../../../core/components/Modal/Modal'
import EventDetails from '../../components/EventDetails/EventDetails.jsx'
import EventDeleteForm from '../../components/EventDeleteForm/EventDeleteForm.jsx'
import EventForm from '../../components/EventForm/EventForm.jsx'

const Events = () => {
    const [mode, setMode] = useState(null)
    const [tab, setTab] = useState('cards')
    const [event, setEvent] = useState(null)
    const { state: events, set: setEvents, sync: syncEvents } = useSync()
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const events = await EventRequester.getMyEvents()
        setEvents(events ?? [])
    }), [withLoad, setEvents])

    useEffect(() => {
        load()
    }, [load])

    const reset = () => {
        setMode(null)
        setEvent(null)
    }

    const onDelete = async (event) => {
        setEvent(event)
        setMode('delete')
    }

    const onEdit = async (event) => {
        setEvent(event)
        setMode('form')
    }

    const onView = (event) => {
        setEvent(event)
        setMode('view')
    }

    const eventDeleteFormHandler = (result) => {
        syncEvents(result, 'delete')
        reset()
    }

    const eventFormHandler = (result) => {
        syncEvents(result, event ? 'update' : 'create')
        reset()
    }

    if (mode === 'view') {
        return <EventDetails event={event} onBack={reset} onEdit={onEdit} onDelete={onDelete} />
    }

    if (mode === 'form') {
        return <EventForm event={event} onBack={reset} handler={eventFormHandler} />
    }

    return (<>
        <div className='lx-p-events'>
            <Loader loading={loading} background='special' />
            <div className='lx-p-events-header'>
                <div className='info'>
                    <h1 className='--name'>Mis eventos</h1>
                    <p className='--description'>Administra todos tus eventos registrados</p>
                    <div className='--overview'>
                        <div className='summary'>
                            {events.length} eventos registrados
                        </div>
                    </div>
                </div>
                <div className='actions'>
                    <Button onClick={() => setMode('form')}>
                        <Icon name='calendar_add_on' />
                        Crear evento
                    </Button>
                </div>
            </div>
            <div className='lx-p-events-content'>
                <div className='lx-p-events-actions'>
                    <TabGroup
                        tabs={[
                            <>Tarjetas <Icon name='square' /></>,
                            <>Tabla <Icon name='table' /></>
                        ]}
                        options={['cards', 'table']}
                        onClick={(option) => {
                            setTab(option)
                        }}
                        active={tab}
                    />
                </div>
                <div className='lx-p-events-container'>
                    {tab === 'cards' && (
                        <div className='lx-p-events-cards'>
                            {
                                <EventCards
                                    events={events}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onView={onView}
                                />
                            }
                        </div>
                    )}
                    {tab === 'table' && (
                        <div className='lx-p-events-table'>
                            {
                                <EventTable
                                    events={events}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onView={onView}
                                />
                            }
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>

        <Modal
            show={mode === 'delete'}
            title='Eliminar evento'
            size='min'
            position='center'
            onClose={reset}
            children={
                <EventDeleteForm
                    event={event}
                    onCancel={reset}
                    handler={eventDeleteFormHandler}
                />
            }
        />
    </>)
}

export default Events