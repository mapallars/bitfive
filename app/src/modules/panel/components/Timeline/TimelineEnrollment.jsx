import './Timeline.css'
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

const EnrollmentTimeline = ({ events, onView }) => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

    const groupedEvents = sortedEvents.reduce((acc, event) => {
        const date = new Date(event.startAt).toISOString().split('T')[0] // YYYY-MM-DD
        if (!acc[date]) acc[date] = []
        acc[date].push(event)
        return acc
    }, {})

    const hasEvents = events.length > 0

    return (
        <div className='lx-c-timeline'>
            {!hasEvents && (
                <div className='lx-c-timeline-empty'>
                    No hay inscripciones en este estado
                </div>
            )}

            {hasEvents && Object.entries(groupedEvents).map(([date, groupedEventsList]) => (
                <div className='lx-c-timeline-date-group' key={date}>
                    <div className='lx-c-timeline-date-header'>
                        <div className='lx-c-timeline-date-point'></div>
                        <div className='lx-c-timeline-date-info'>
                            <div className='lx-c-timeline-date'>{getHeaderText(date)}</div>
                            <div className='lx-c-timeline-day'>{getDiaSemana(date)}</div>
                        </div>
                    </div>
                    <div className='lx-c-timeline-events'>
                        {groupedEventsList.map((event) => (
                            <TimelineEventCard
                                key={event.id}
                                event={event}
                                onView={onView}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EnrollmentTimeline