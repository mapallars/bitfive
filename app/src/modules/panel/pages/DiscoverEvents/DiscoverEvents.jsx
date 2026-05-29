import './DiscoverEvents.css'
import { useState, useEffect, useCallback } from 'react'
import { useLoad } from '../../../../core/hooks/useLoad'
import EventRequester from '../../services/EventRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import Footer from '../../../../core/components/Footer/Footer'
import EventDetailModal from './components/EventDetailModal/EventDetailModal'
import EventTable from '../../components/EventTable/EventTable'
import Timeline from '../../components/Timeline/Timeline'
import { useSync } from '../../../../core/hooks/useSync'
import Modal from '../../../../core/components/Modal/Modal'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import { useAuth } from '../../../../core/contexts/AuthContext'
import { timeFormatter } from '../../../../core/utils/novato.mjs'
import GroupedEvents from './GroupedEvents'

const DiscoverEvents = () => {
    const [timeline, setTimeline] = useState(false)
    const [search, setSearch] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const { state: events, set: setEvents, sync: syncEvents } = useSync()
    const { loading, withLoad } = useLoad(true)
    const { user } = useAuth()

    const load = useCallback(() => withLoad(async () => {
        const events = await EventRequester.getEvents()
        setEvents(events ?? [])
    }), [withLoad, setEvents])

    const handleEnrollment = (event) => {
        syncEvents(event, 'update')
    }

    useEffect(() => {
        load()
    }, [load])

    return (<>
        <div className='lx-p-discover-events'>
            <Loader loading={loading} background='special' />

            <div className='lx-p-discover-events-greeting'>
                <h1>{timeFormatter()}, <span className='lx-text-color-softer'>{user?.name}</span></h1>
                <p className='lx-text-color-softest'>Explora los eventos disponibles y encuentra el que más te guste</p>
            </div>

            <GroupedEvents events={events} onView={setSelectedEvent} />

            <div className='lx-p-discover-events-float'>
                <Button size='xl' radius='full' icon onClick={() => setSearch(true)}><Icon name='search' /></Button>
                <Button size='xl' radius='full' color='warning' icon onClick={() => setTimeline(true)}><Icon name='search_activity' /></Button>
            </div>

            <Footer />


        </div>

        <Modal
            show={selectedEvent}
            title={selectedEvent?.name}
            size='max'
            position='right '
            onClose={() => setSelectedEvent(null)}
            children={
                <EventDetailModal
                    event={selectedEvent}
                    onEnrollment={handleEnrollment}
                />
            }
        />

        <Modal
            show={!selectedEvent && timeline}
            title='Eventos'
            size='middle'
            position='right'
            onClose={() => setTimeline(false)}
            children={
                <div className='lx-p-discover-events-timeline'>
                    <Timeline events={events} onView={setSelectedEvent} />
                </div>
            }
        />

        <Modal
            show={!selectedEvent && search}
            title='Buscar eventos'
            size='max'
            position='center'
            onClose={() => setSearch(false)}
            children={
                <div className='lx-p-discover-events-search'>
                    <EventTable events={events} onView={setSelectedEvent} />
                </div>
            }
        />
    </>
    )
}

export default DiscoverEvents
