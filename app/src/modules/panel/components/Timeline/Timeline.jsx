import './Timeline.css'
import { useState } from 'react'
import Icon from '../../../../core/components/Icon/Icon'
import TimelineEventCard from './TimelineEventCard'

const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
]

const getDiaSemana = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-").map(Number)
    const fecha = new Date(year, month - 1, day)
    return dias[fecha.getDay()]
}

const getHeaderText = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const fecha = new Date(year, month - 1, day)

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const manana = new Date(hoy)
    manana.setDate(hoy.getDate() + 1)

    const fechaSolo = new Date(year, month - 1, day)
    fechaSolo.setHours(0, 0, 0, 0)

    if (fechaSolo.getTime() === hoy.getTime()) return "Hoy"
    if (fechaSolo.getTime() === manana.getTime()) return "Mañana"

    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short"
    }).format(fecha).replace(".", "")
}

const Timeline = ({ events, onView }) => {
    const [activeTab, setActiveTab] = useState('upcoming')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isUpcomingEvent = (event) => new Date(event.startAt) >= today
    const isPastEvent = (event) => new Date(event.startAt) < today

    const filteredEvents = events.filter((event) => {
        return activeTab === 'upcoming'
            ? isUpcomingEvent(event)
            : isPastEvent(event)
    })

    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    if (activeTab === 'past') sortedEvents.reverse()

    const groupedEvents = sortedEvents.reduce((acc, event) => {
        const date = new Date(event.startAt).toISOString().split('T')[0] // YYYY-MM-DD
        if (!acc[date]) acc[date] = []
        acc[date].push(event)
        return acc
    }, {})

    const hasEvents = events.length > 0
    const hasFilteredEvents = sortedEvents.length > 0

    return (
        <div className='lx-c-timeline'>
            <div className='lx-c-timeline-controls'>
                <div className='lx-c-tab-group'>
                    <div
                        className={`lx-c-tab-group-tab ${activeTab === 'upcoming' ? 'active' : 'inactive'}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <span>Próximos</span>
                        <Icon name='event_upcoming' size='m' />
                    </div>
                    <div
                        className={`lx-c-tab-group-tab ${activeTab === 'past' ? 'active' : 'inactive'}`}
                        onClick={() => setActiveTab('past')}
                    >
                        <span>Pasados</span>
                        <Icon name='history' size='m' />
                    </div>
                </div>
            </div>

            {!hasEvents && (
                <div className='lx-c-timeline-empty'>
                    No hay eventos programados
                </div>
            )}

            {hasEvents && !hasFilteredEvents && (
                <div className='lx-c-timeline-empty'>
                    {activeTab === 'upcoming'
                        ? 'No hay eventos próximos disponibles'
                        : 'No hay eventos pasados disponibles'}
                </div>
            )}

            {hasFilteredEvents && Object.entries(groupedEvents).map(([date, groupedEventsList]) => (
                <div className='lx-c-timeline-date-group' key={date}>
                    <div className='lx-c-timeline-date-header'>
                        <div className='lx-c-timeline-date-point'></div>
                        <h3 className='lx-c-timeline-date-title'>
                            {getHeaderText(date)}{" "}
                            <span className='lx-c-timeline-day-name'>
                                {getDiaSemana(date)}
                            </span>
                        </h3>
                    </div>

                    {groupedEventsList.map((event) => (
                        <div className='lx-c-timeline-item' key={event.id}>
                            <div className='lx-c-timeline-point'></div>
                            <TimelineEventCard
                                event={event}
                                onClick={() => onView(event)}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Timeline