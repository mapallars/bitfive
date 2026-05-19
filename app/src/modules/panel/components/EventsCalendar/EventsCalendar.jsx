import { useState, useMemo, useCallback } from 'react'
import './EventsCalendar.css'
import {
    getMonthDays,
    getWeekDays,
    getDayHours,
    getEventsForDay,
    isAllDayEvent,
    formatEventTime,
    navigateDate,
    isSameDay,
    getLocalDateString
} from './EventsCalendar.utils'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EventChip = ({ event, onClick }) => {
    return (
        <button
            className="lx-c-events-calendar-event-chip"
            style={{ backgroundColor: event.color || 'var(--color-primary, #000000)' }}
            onClick={(e) => {
                e.stopPropagation()
                onClick(event)
            }}
            aria-label={`Event: ${event.name}`}
        >
            {event.name}
        </button>
    )
}

const TimeGridEvent = ({ event, date, onClick }) => {
    const start = new Date(event.startAt)
    const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000)

    let top = 0
    let height = 60 // default 1h = 60px

    const tz = event.timezone
    const startDayStr = getLocalDateString(start, tz)
    const endDayStr = getLocalDateString(end, tz)
    const targetDayStr = getLocalDateString(date)

    if (startDayStr === targetDayStr) {
        let hours = start.getHours()
        let minutes = start.getMinutes()
        if (tz) {
            try {
                const parts = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false
                }).formatToParts(start)
                const hourPart = parts.find(p => p.type === 'hour')
                const minutePart = parts.find(p => p.type === 'minute')
                if (hourPart) hours = parseInt(hourPart.value, 10)
                if (minutePart) minutes = parseInt(minutePart.value, 10)
            } catch (e) {
                // fallback to local
                console.error(e);
            }
        }
        top = hours * 60 + minutes
    }

    if (endDayStr === targetDayStr) {
        let hours = end.getHours()
        let minutes = end.getMinutes()
        if (tz) {
            try {
                const parts = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false
                }).formatToParts(end)
                const hourPart = parts.find(p => p.type === 'hour')
                const minutePart = parts.find(p => p.type === 'minute')
                if (hourPart) hours = parseInt(hourPart.value, 10)
                if (minutePart) minutes = parseInt(minutePart.value, 10)
            } catch (e) {
                // fallback to local
                console.error(e);
            }
        }
        height = (hours * 60 + minutes) - top
    } else {
        height = 24 * 60 - top
    }

    if (height < 20) height = 20 // Minimum height for visibility

    return (
        <div
            className="lx-c-events-calendar-time-event"
            style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: event.color || 'var(--color-primary, #000000)'
            }}
            onClick={(e) => {
                e.stopPropagation()
                onClick(event)
            }}
            role="button"
            tabIndex={0}
            aria-label={`Event: ${event.name} from ${formatEventTime(event.startAt, event.timezone)}`}
        >
            <div className="lx-c-events-calendar-time-event-title">{event.name}</div>
            <div className="lx-c-events-calendar-time-event-time">
                {formatEventTime(event.startAt, event.timezone)}
            </div>
        </div>
    )
}

const MonthView = ({ currentDate, events, onView }) => {
    const days = useMemo(() => getMonthDays(currentDate), [currentDate])

    return (
        <div className="lx-c-events-calendar-view-container" role="grid" aria-label="Month View">
            <div className="lx-c-events-calendar-month-header">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="lx-c-events-calendar-day-header">{day}</div>
                ))}
            </div>
            <div className="lx-c-events-calendar-month-grid">
                {days.map((day, idx) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = isSameDay(day, new Date())
                    const dayEvents = getEventsForDay(events, day)
                    const maxVisible = 3
                    const visibleEvents = dayEvents.slice(0, maxVisible)
                    const hiddenCount = dayEvents.length - maxVisible

                    return (
                        <div
                            key={idx}
                            className={`lx-c-events-calendar-month-cell ${!isCurrentMonth ? 'not-current-month' : ''}`}
                            role="gridcell"
                        >
                            <div className={`lx-c-events-calendar-date-number ${isToday ? 'today' : ''}`}>
                                {day.getDate()}
                            </div>
                            {visibleEvents.map(event => (
                                <EventChip key={event.id} event={event} onClick={onView} />
                            ))}
                            {hiddenCount > 0 && (
                                <button className="lx-c-events-calendar-more-events">
                                    +{hiddenCount} more
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const WeekView = ({ currentDate, events, onView }) => {
    const days = useMemo(() => getWeekDays(currentDate), [currentDate])
    const hours = useMemo(() => getDayHours(), [])

    return (
        <div className="lx-c-events-calendar-view-container lx-c-events-calendar-time-view">
            <div className="lx-c-events-calendar-time-header">
                <div className="lx-c-events-calendar-time-spacer"></div>
                <div className="lx-c-events-calendar-day-columns-header">
                    {days.map((day, idx) => {
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={idx} className="lx-c-events-calendar-day-column-header">
                                <div className="lx-c-events-calendar-day-column-day">{DAYS_OF_WEEK[day.getDay()]}</div>
                                <div className={`lx-c-events-calendar-day-column-date ${isToday ? 'today' : ''}`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* All Day Row */}
            <div className="lx-c-events-calendar-allday-row">
                <div className="lx-c-events-calendar-time-spacer">
                    <span className="lx-c-events-calendar-allday-label">All-day</span>
                </div>
                <div className="lx-c-events-calendar-allday-cells">
                    {days.map((day, idx) => {
                        const dayAllDayEvents = getEventsForDay(events, day).filter(e => isAllDayEvent(e))
                        return (
                            <div key={idx} className="lx-c-events-calendar-allday-cell">
                                {dayAllDayEvents.map(event => (
                                    <EventChip key={event.id} event={event} onClick={onView} />
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="lx-c-events-calendar-time-body">
                <div className="lx-c-events-calendar-time-labels">
                    {hours.map(hour => (
                        <div key={hour} className="lx-c-events-calendar-time-label">
                            <span>{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span>
                        </div>
                    ))}
                </div>
                <div className="lx-c-events-calendar-day-columns">
                    <div className="lx-c-events-calendar-grid-lines">
                        {hours.map(hour => (
                            <div key={hour} className="lx-c-events-calendar-grid-line"></div>
                        ))}
                    </div>
                    {days.map((day, idx) => {
                        const dayEvents = getEventsForDay(events, day).filter(e => !isAllDayEvent(e))
                        return (
                            <div key={idx} className="lx-c-events-calendar-day-column">
                                {dayEvents.map(event => (
                                    <TimeGridEvent
                                        key={`${event.id}-${day.getTime()}`}
                                        event={event}
                                        date={day}
                                        onClick={onView}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const DayView = ({ currentDate, events, onView }) => {
    const hours = useMemo(() => getDayHours(), [])
    const isToday = isSameDay(currentDate, new Date())
    const dayEvents = useMemo(() => getEventsForDay(events, currentDate).filter(e => !isAllDayEvent(e)), [events, currentDate])
    const allDayEvents = useMemo(() => getEventsForDay(events, currentDate).filter(e => isAllDayEvent(e)), [events, currentDate])

    return (
        <div className="lx-c-events-calendar-view-container lx-c-events-calendar-time-view">
            <div className="lx-c-events-calendar-time-header">
                <div className="lx-c-events-calendar-time-spacer"></div>
                <div className="lx-c-events-calendar-day-columns-header">
                    <div className="lx-c-events-calendar-day-column-header">
                        <div className="lx-c-events-calendar-day-column-day">{DAYS_OF_WEEK[currentDate.getDay()]}</div>
                        <div className={`lx-c-events-calendar-day-column-date ${isToday ? 'today' : ''}`}>
                            {currentDate.getDate()}
                        </div>
                    </div>
                </div>
            </div>

            {/* All Day Row */}
            <div className="lx-c-events-calendar-allday-row">
                <div className="lx-c-events-calendar-time-spacer">
                    <span className="lx-c-events-calendar-allday-label">All-day</span>
                </div>
                <div className="lx-c-events-calendar-allday-cells">
                    <div className="lx-c-events-calendar-allday-cell">
                        {allDayEvents.map(event => (
                            <EventChip key={event.id} event={event} onClick={onView} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="lx-c-events-calendar-time-body">
                <div className="lx-c-events-calendar-time-labels">
                    {hours.map(hour => (
                        <div key={hour} className="lx-c-events-calendar-time-label">
                            <span>{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span>
                        </div>
                    ))}
                </div>
                <div className="lx-c-events-calendar-day-columns">
                    <div className="lx-c-events-calendar-grid-lines">
                        {hours.map(hour => (
                            <div key={hour} className="lx-c-events-calendar-grid-line"></div>
                        ))}
                    </div>
                    <div className="lx-c-events-calendar-day-column">
                        {dayEvents.map(event => (
                            <TimeGridEvent
                                key={event.id}
                                event={event}
                                date={currentDate}
                                onClick={onView}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const EventsCalendar = ({ events = [], onView }) => {
    const [view, setView] = useState('month')
    const [currentDate, setCurrentDate] = useState(new Date())

    const handlePrev = useCallback(() => {
        setCurrentDate(prev => navigateDate(prev, view, -1))
    }, [view])

    const handleNext = useCallback(() => {
        setCurrentDate(prev => navigateDate(prev, view, 1))
    }, [view])

    const handleToday = useCallback(() => {
        setCurrentDate(new Date())
    }, [])

    const formatHeaderDate = () => {
        if (view === 'month') {
            return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        }
        if (view === 'week') {
            const days = getWeekDays(currentDate)
            const start = days[0]
            const end = days[6]
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleString('en-US', { month: 'long' })} ${start.getFullYear()}`
            }
            return `${start.toLocaleString('en-US', { month: 'short' })} - ${end.toLocaleString('en-US', { month: 'short' })} ${start.getFullYear()}`
        }
        return currentDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="lx-c-events-calendar-container">
            <div className="lx-c-events-calendar-header">
                <div className="lx-c-events-calendar-toolbar-left">
                    <Button color='auto' variant='dimed' size='s' onClick={handleToday}>Today</Button>
                    <Button color='auto' variant='bordered' size='s' icon onClick={handlePrev} aria-label="Previous">
                        <Icon name="chevron_left" />
                    </Button>
                    <Button color='auto' variant='bordered' size='s' icon onClick={handleNext} aria-label="Next">
                        <Icon name="chevron_right" />
                    </Button>
                    <h2 className="lx-c-events-calendar-title">{formatHeaderDate()}</h2>
                </div>
                <div className="lx-c-events-calendar-toolbar-right">
                    <div className="lx-c-events-calendar-segmented-control" role="group" aria-label="View selection">
                        {['month', 'week', 'day'].map(v => (
                            <button
                                key={v}
                                className={`lx-c-events-calendar-segment-btn ${view === v ? 'active' : ''}`}
                                onClick={() => setView(v)}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {view === 'month' && <MonthView currentDate={currentDate} events={events} onView={onView} />}
            {view === 'week' && <WeekView currentDate={currentDate} events={events} onView={onView} />}
            {view === 'day' && <DayView currentDate={currentDate} events={events} onView={onView} />}
        </div>
    )
}

export default EventsCalendar