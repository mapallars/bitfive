import './GroupedEvents.css'
import EventCard from "../../components/EventCard/EventCard"

const GroupedEvents = ({ events = [], onView }) => {
    const groupedEvents = events.reduce((acc, event) => {
        const category = event.category || "Sin categoría"

        if (!acc[category]) {
            acc[category] = []
        }

        acc[category].push(event)

        return acc
    }, {})

    return (
        <div className="lx-c-grouped-events">
            {Object.entries(groupedEvents).map(([category, categoryEvents]) => (
                <section key={category} className="lx-c-grouped-events-category-section">
                    <h2 className="lx-c-grouped-events-category-title">#{category}</h2>

                    <div className="lx-c-grouped-events-list">
                        {categoryEvents.map((event) => (
                            <div className='lx-c-grouped-events-event' key={event.id}>
                                <EventCard
                                    event={event}
                                    onView={onView}
                                    disableActions={true}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}

export default GroupedEvents