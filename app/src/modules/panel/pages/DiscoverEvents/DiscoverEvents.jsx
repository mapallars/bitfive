import './DiscoverEvents.css'
import { useState, useEffect, useCallback } from 'react'
import { useLoad } from '../../../../core/hooks/useLoad'
import EventRequester from '../../services/EventRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import Footer from '../../../../core/components/Footer/Footer'
import AvailableEvents from './components/AvailableEvents/AvailableEvents'
import NearbyEvents from './components/NearbyEvents/NearbyEvents'
import EventDetailModal from './components/EventDetailModal/EventDetailModal'
import EventTable from '../../components/EventTable/EventTable'
import { useSync } from '../../../../core/hooks/useSync'

const DiscoverEvents = () => {
    const [selectedEvent, setSelectedEvent] = useState(null)
    const { state: events, set: setEvents, sync: syncEvents } = useSync()
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const events = await EventRequester.getEvents()
        setEvents(events ?? [])
    }), [withLoad])

    const handleEnrollment = (event) => {
        syncEvents(event, 'update')
    }

    useEffect(() => {
        load()
    }, [load])

    return (
        <div className='lx-p-discover-events'>
            <Loader loading={loading} background='special' />

            <div className='lx-p-discover-events-header'>
                <div className='lx-p-discover-events-header-content'>
                    <h1 className='lx-p-discover-events-title'>Descubrir Eventos</h1>
                    <p className='lx-p-discover-events-description'>
                        Explora todos los eventos disponibles y encuentra aquellos cercanos a ti
                    </p>
                </div>
            </div>

            <div className='lx-p-discover-events-content'>
                <div className='lx-p-discover-events-container'>
                    <div className='lx-p-discover-events-section'>
                        <div className='lx-p-discover-events-section-header'>
                            <h2 className='lx-p-discover-events-section-title'>Próximos Eventos</h2>
                            <p className='lx-p-discover-events-section-description'>
                                Los 8 eventos más próximos organizados por fecha
                            </p>
                        </div>
                        <EventTable events={events} onView={setSelectedEvent} />
                    </div>
                    <div className='lx-p-discover-events-section'>
                        <div className='lx-p-discover-events-section-header'>
                            <h2 className='lx-p-discover-events-section-title'>Todos los Eventos</h2>
                            <p className='lx-p-discover-events-section-description'>
                                Todos los eventos disponibles en el sistema
                            </p>
                        </div>
                        <EventTable events={events} onView={setSelectedEvent} />
                    </div>
                </div>
            </div>

            <Footer />

            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEnrollment={handleEnrollment}
            />
        </div>
    )
}

export default DiscoverEvents
