import './Events.css'
import { useState, useEffect, useCallback } from 'react'
import { useSync } from '../../../../core/hooks/useSync'
import { useLoad } from '../../../../core/hooks/useLoad'
import EventRequester from '../../services/EventRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import TabGroup from '../../../../core/components/TabGroup/TabGroup'
import Icon from '../../../../core/components/Icon/Icon'
import EventCards from '../../components/EventCards/EventCards.jsx'
import EventTable from '../../components/EventTable/EventsTable.jsx'
import Footer from '../../../../core/components/Footer/Footer'
import Modal from '../../../../core/components/Modal/Modal'
import EventDetails from '../../components/EventDetails/EventDetails.jsx'
import EventDeleteForm from '../../components/EventDeleteForm/EventDeleteForm.jsx'

const Events = () => {
    const [mode, setMode] = useState(null)
    const [tab, setTab] = useState('events')
    const [event, setEvent] = useState(null)
    const { state: events, set: setEvents, sync: syncEvents } = useSync()
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const events = await EventRequester.getEvents()
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

    const onView = (event) => {
        setEvent(event)
        setMode('view')
    }

    const eventDeleteFormHandler = (result) => {
        syncEvents(result, 'delete')
        reset()
    }

    return (<>
        <div className='lx-p-events'>
            <Loader loading={loading} background='special' />
            <div className='lx-p-events-header'>
                <div className='info'>
                    <h1 className='--name'>Eventos</h1>
                    <p className='--description'>Administre los eventos del sistema</p>
                    <div className='--overview'>
                        <div className='summary'>
                            {events.length} eventos registrados
                        </div>
                    </div>
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
                    />
                </div>
                <div className='lx-p-events-container'>
                    {tab === 'cards' && (
                        <div className='lx-p-events-cards'>
                            {
                                <EventCards
                                    events={events}
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
            show={mode === 'view'}
            title='Detalles del evento'
            size='large'
            position='right'
            onClose={reset}
            children={
                <EventDetails event={event} onDelete={onDelete} />
            }
        />

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