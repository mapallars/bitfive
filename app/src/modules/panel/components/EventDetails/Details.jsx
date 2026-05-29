import Icon from "../../../../core/components/Icon/Icon"
import SatatusTag from "../../../../core/components/StatusTag/StatusTag"
import DateFormat from "../../../../core/utils/dateFormat.mjs"
import Constant from "../../constants/constant.mjs"
import { EVENT } from "../../constants/event.constant.mjs"

const Details = ({ event, enrollment = null }) => {
    if (!event) return null
    return (
        <>
            <div className='lx-c-event-details-layout' style={{ '--lx-c-event-details-color': event.color }}>
                <div className='lx-c-event-details-main'>
                    <div className='lx-c-event-details-description-section'>
                        <h3 className='lx-c-event-details-section-title'>
                            <Icon name='description' /> Acerca de este evento
                        </h3>
                        <p className='lx-c-event-details-description-text'>
                            {event.description || 'Este evento no tiene una descripción detallada.'}
                        </p>
                    </div>

                    <div className='lx-c-event-details-specs-section'>
                        <h3 className='lx-c-event-details-section-title'>
                            <Icon name='info' /> Especificaciones
                        </h3>
                        <div className='lx-c-event-details-specs-grid'>
                            <div className='lx-c-event-details-spec-item'>
                                <span className='--label'>Categoría</span>
                                <span className='--value'>{event.category || 'Sin categoría'}</span>
                            </div>
                            <div className='lx-c-event-details-spec-item'>
                                <span className='--label'>Tipo de Evento</span>
                                <span className='--value'>{Constant.fromValue(EVENT.OPTIONS.TYPE, event.type) || 'No definido'}</span>
                            </div>
                            <div className='lx-c-event-details-spec-item'>
                                <span className='--label'>Visibilidad</span>
                                <span className='--value'>{Constant.fromValue(EVENT.OPTIONS.VISIBILITY, event.visibility) || 'Pública'}</span>
                            </div>
                            <div className='lx-c-event-details-spec-item'>
                                <span className='--label'>Zona Horaria</span>
                                <span className='--value'>{Constant.fromValue(EVENT.OPTIONS.TIMEZONE, event.timezone) || event.timezone || 'No definida'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='lx-c-event-details-sidebar'>
                    <div className='lx-c-event-details-widget-card --accent-card'>
                        <div className='lx-c-event-details-widget-price-tag'>
                            <span className='--price'>{event.price ? `$${event.price}` : 'Gratis'}</span>
                            <span className='--label'>Costo de entrada</span>
                        </div>
                        <div className='lx-c-event-details-widget-badge-row'>
                            <span className='lx-c-event-details-widget-badge'>
                                <Icon name='lock_open' /> {Constant.fromValue(EVENT.OPTIONS.VISIBILITY, event.visibility) || 'Pública'}
                            </span>
                            <span className='lx-c-event-details-widget-badge'>
                                <Icon name='apartment' /> {Constant.fromValue(EVENT.OPTIONS.TYPE, event.type) || 'Presencial'}
                            </span>
                        </div>
                    </div>

                    <div className='lx-c-event-details-widget-card'>
                        <div className='lx-c-event-details-widget-datetime'>
                            <div className='lx-c-event-details-calendar-icon'>
                                <span className='--month'>{event.startAt ? new Date(event.startAt).toLocaleString('es-CO', { month: 'short' }).toUpperCase() : '---'}</span>
                                <span className='--day'>{event.startAt ? new Date(event.startAt).getDate() : '--'}</span>
                            </div>
                            <div className='lx-c-event-details-datetime-info'>
                                <p className='--title'>Fecha y Hora</p>
                                <p className='--start'>{event.startAt ? DateFormat.string(event.startAt) : 'No definido'}</p>
                                {event.endAt && (
                                    <p className='--end'>Termina: {DateFormat.string(event.endAt)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='lx-c-event-details-widget-card'>
                        <div className='lx-c-event-details-widget-item'>
                            <Icon name='location_on' />
                            <div className='--content'>
                                <p className='--title'>Ubicación</p>
                                <p className='--value'>{event.location || 'Sin ubicación'}</p>
                            </div>
                        </div>
                        <div className='lx-c-event-details-widget-item'>
                            <Icon name='local_parking' />
                            <div className='--content'>
                                <p className='--title'>Estacionamiento</p>
                                <p className='--value'>{event.hasParking ? 'Disponible' : 'No disponible'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='lx-c-event-details-widget-card'>
                        <div className='lx-c-event-details-widget-capacity'>
                            <div className='--header'>
                                <span className='--title'>Aforo y Estado</span>
                                <SatatusTag status={event.isActive} message={event.isActive ? 'Activo' : 'Inactivo'} />
                            </div>
                            <div className='--stat-row'>
                                <span className='--stat'>{event.enrollments?.length ?? 0} / {event.maxCapacity || 'Ilimitada'} inscritos</span>
                            </div>
                            {event.maxCapacity && (
                                <div className='lx-c-event-details-widget-progress-bar'>
                                    <div
                                        className='--fill'
                                        style={{
                                            width: `${Math.min(100, ((event.enrollments?.length ?? 0) / event.maxCapacity) * 100)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {enrollment}
                    </div>

                    <div className='lx-c-event-details-widget-card'>
                        <div className='lx-c-event-details-widget-organizers'>
                            <div className='--header'>
                                <span className='--title'>Organizadores</span>
                                <span className='--count'>{event.organizers?.length ?? 0}</span>
                            </div>
                            <div className='lx-c-event-details-widget-organizers-list'>
                                {event.organizers?.length > 0 ? event.organizers.map((organizer) => (
                                    <div key={organizer.id} className='lx-c-event-details-widget-organizer'>
                                        <div className={`lx-c-event-details-widget-organizer-avatar ${organizer.isOnline && '--online'}`}>
                                            {organizer.image ? <img className='--image' src={organizer.image} alt={organizer.name} /> : <div className='--chars'>{organizer.name?.slice(0, 2) ?? '?'}</div>}
                                        </div>
                                        <div className='--content'>
                                            <p className='--name'>{organizer.name}</p>
                                            <p className='--username'>@{organizer.username}</p>
                                        </div>
                                    </div>
                                ))
                                    : <div className='lx-c-event-details-widget-organizer'>
                                        <p className='--name'>Sin organizadores</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Details