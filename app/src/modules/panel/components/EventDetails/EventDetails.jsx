import './EventDetails.css'
import { useCallback, useEffect, useState } from 'react'
import Loader from '../../../../core/components/Loader/Loader'
import Icon from '../../../../core/components/Icon/Icon'
import TabGroup from '../../../../core/components/TabGroup/TabGroup'
import Footer from '../../../../core/components/Footer/Footer'
import Modal from '../../../../core/components/Modal/Modal'
import { useLoad } from '../../../../core/hooks/useLoad'
import AuthRequester from '../../services/AuthRequester.mjs'
import Button from '../../../../core/components/Button/Button'
import Table from '../../../../core/components/Table/Table'
import DateFormat from '../../../../core/utils/dateFormat.mjs'
import Constant from '../../constants/constant.mjs'
import { EVENT } from '../../constants/event.constant.mjs'
import SatatusTag from '../../../../core/components/StatusTag/StatusTag'
import EventRequester from '../../services/EventRequester.mjs'
import ScannerQR from '../ScannerQR/ScannerQR'
import EnrollmentRequester from '../../services/EnrollmentRequester.mjs'
import Empity from '../../../../core/components/Empity/Empity'

const EventDetails = ({ event: _event, onBack, onEdit, onDelete }) => {
    const [event, setEvent] = useState(_event)
    const [mode, setMode] = useState(null)
    const [checkInMode, setCheckInMode] = useState(false)
    const [tab, setTab] = useState('details')
    const [users, setUsers] = useState([])
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const users = await AuthRequester.getUsers()
        setUsers(users ?? [])
    }), [withLoad, setUsers])

    useEffect(() => {
        load()
    }, [load])

    const addOrganizer = async (organizer) => {
        const eventUpdated = await EventRequester.addOrganizer(event, organizer)
        setEvent(eventUpdated)
    }

    const removeOrganizer = async (organizer) => {
        const eventUpdated = await EventRequester.removeOrganizer(event, organizer)
        setEvent(eventUpdated)
    }

    const handleEnrollmentCheckIn = async (enrollmentId) => {
        setCheckInMode(true)
        const enrollmentUpdated = await EnrollmentRequester.checkInEnrollment(event.id, enrollmentId)
        const eventUpdated = { ...event, enrollments: event.enrollments.map(enrollment => enrollment.id === enrollmentId ? enrollmentUpdated : enrollment) }
        if (enrollmentUpdated) setEvent(eventUpdated)
        setCheckInMode(false)
    }

    if (!_event) return null

    return (
        <>
            <div className='lx-c-event-details' style={{ '--lx-c-event-details-color': event.color }}>
                <Loader loading={loading} background='special' />
                <div className='lx-c-event-details-header'>
                    <div className='info'>
                        <Button color='auto' variant='bordered' icon onClick={onBack}>
                            <Icon name='arrow_back' />
                        </Button>
                        <h1 className='--name'>{event.name || 'Evento sin nombre'}</h1>
                    </div>
                    <div className='actions'>
                        <Button color='auto' variant='dimed' size='s' icon onClick={() => onEdit(event)}>
                            <Icon name='edit' />
                        </Button>
                        <Button color='danger' variant='dimed' size='s' icon onClick={() => onDelete(event)}>
                            <Icon name='delete' />
                        </Button>
                    </div>
                </div>
                <div className='lx-c-event-details-content'>
                    <div className='lx-c-event-details-actions'>
                        <TabGroup
                            tabs={[
                                <>Detalles <Icon name='event_note' /></>,
                                <>Organizadores <Icon name='groups' /></>,
                                <>Inscritos <Icon name='event_seat' /></>
                            ]}
                            options={['details', 'organizers', 'enrollments']}
                            onClick={(option) => {
                                setTab(option)
                            }}
                            active={tab}
                        />
                    </div>
                    <div className='lx-c-event-details-container'>
                        {tab === 'details' && (
                            <div className='lx-c-event-details-layout'>
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
                        )}
                        {tab === 'organizers' && (
                            <>
                                <Button size='s' onClick={() => setMode('organizers')}>
                                    <Icon name='person_add' />
                                    Añadir organizadores
                                </Button>
                                <br />
                                <br />
                                <Table
                                    objects={event?.organizers ?? []}
                                    mapper={(organizer, index) => ({
                                        '#': index + 1,
                                        '': <div className={`lx-c-user-table-avatar ${organizer.isOnline && '--online'}`}>
                                            {organizer.image ? <img className='--image' src={organizer.image} alt={organizer.name} /> : <div className='--chars'>{organizer.name?.slice(0, 2) ?? '?'}</div>}
                                        </div>,
                                        name: <div>
                                            <p className='lx-text-color'>{organizer.name}</p>
                                            <p className='lx-text-color-softest'>@{organizer.username}</p>
                                        </div>,
                                        document: <span className='lx-text-color-softer'>{organizer.documentType || ''} {organizer.documentNumber || 'Sin documento'}</span>,
                                        contact: <div className='lx-tags'>
                                            <span className='lx-tag'>{organizer.email || 'Sin correo'}</span>
                                            <span className='lx-tag'>{organizer.phoneNumber || 'Sin teléfono'}</span>
                                        </div>,
                                        birthdate: new Date(organizer.birthdate).toLocaleDateString(),
                                        isOnline: <SatatusTag status={organizer.isOnline} message={organizer.isOnline ? 'Online' : 'Offline'} />,
                                        lastLogin: organizer.lastLogin ? new Date(organizer.lastLogin).toLocaleString() : 'Nunca',
                                        actions: <center>
                                            <Button color='danger' size='s' onClick={() => removeOrganizer(organizer)}>
                                                <Icon name='delete' />
                                                Quitar
                                            </Button>
                                        </center>
                                    })}
                                    translation={{
                                        name: 'Nombre',
                                        username: 'Usuario',
                                        contact: 'Contacto',
                                        document: 'Documento',
                                        birthdate: 'Cumpleaños',
                                        isOnline: 'Online',
                                        lastLogin: 'Último ingreso',
                                        actions: 'Acciones'
                                    }}
                                    selectionable={false}
                                    empity={<Empity icon='groups' message='No hay organizadores' />}
                                />
                            </>
                        )}
                        {tab === 'enrollments' && (
                            <>
                                <Button size='s' onClick={() => setMode('check-in')}>
                                    <Icon name='qr_code_scanner' />
                                    Check-in de inscripciones
                                </Button>
                                <br />
                                <br />
                                <Table
                                    objects={event?.enrollments ?? []}
                                    mapper={(enrollment, index) => ({
                                        '#': index + 1,
                                        '': <div className={`lx-c-user-table-avatar ${enrollment.user.isOnline && '--online'}`}>
                                            {enrollment.user.image ? <img className='--image' src={enrollment.user.image} alt={enrollment.user.name} /> : <div className='--chars'>{enrollment.user.name?.slice(0, 2) ?? '?'}</div>}
                                        </div>,
                                        name: <div>
                                            <p className='lx-text-color'>{enrollment.user.name}</p>
                                            <p className='lx-text-color-softest'>@{enrollment.user.username}</p>
                                        </div>,
                                        document: <span className='lx-text-color-softer'>{enrollment.user.documentType || ''} {enrollment.user.documentNumber || 'Sin documento'}</span>,
                                        contact: <div className='lx-tags'>
                                            <span className='lx-tag'>{enrollment.user.email || 'Sin correo'}</span>
                                            <span className='lx-tag'>{enrollment.user.phoneNumber || 'Sin teléfono'}</span>
                                        </div>,
                                        isOnline: <SatatusTag status={enrollment.user.isOnline} message={enrollment.user.isOnline ? 'Online' : 'Offline'} />,
                                        lastLogin: enrollment.user.lastLogin ? new Date(enrollment.user.lastLogin).toLocaleString() : 'Nunca',
                                        date: <div className='lx-c-event-details-enrollment-date'>
                                            <span className={`lx-c-event-details-enrollment-status --${enrollment.enrollmentStatus}`}>{Constant.fromValue(EVENT.OPTIONS.ENROLLMENT_STATUS, enrollment.enrollmentStatus)}</span>
                                            <p className='lx-text-color-soft'>{DateFormat.string(enrollment.date)}</p>
                                        </div>,
                                    })}
                                    translation={{
                                        name: 'Nombre',
                                        username: 'Usuario',
                                        contact: 'Contacto',
                                        document: 'Documento',
                                        isOnline: 'Online',
                                        lastLogin: 'Último ingreso',
                                        date: 'Inscripción',
                                    }}
                                    selectionable={false}
                                    empity={<Empity icon='event_seat' message='No hay inscripciones' />}
                                />
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>

            <Modal
                show={mode === 'organizers'}
                title='Añadir organizadores'
                size='max'
                position='center'
                onClose={() => setMode(null)}
                children={
                    <div className='lx-c-event-details-add-organizers'>
                        <p className='lx-text-color-softer'>Agrega usuarios como organizadores del evento <b>{event.name}</b>.</p>
                        <br />
                        <Table
                            objects={users ?? []}
                            mapper={(user) => ({
                                '': <div className={`lx-c-user-table-avatar ${user.isOnline && '--online'}`}>
                                    {user.image ? <img className='--image' src={user.image} alt={user.name} /> : <div className='--chars'>{user.name?.slice(0, 2) ?? '?'}</div>}
                                </div>,
                                name: <div>
                                    <p className='lx-text-color'>{user.name}</p>
                                    <p className='lx-text-color-softest'>@{user.username}</p>
                                </div>,
                                document: <span className='lx-text-color-softer'>{user.documentType || ''} {user.documentNumber || 'Sin documento'}</span>,
                                contact: <div className='lx-tags'>
                                    <span className='lx-tag'>{user.email || 'Sin correo'}</span>
                                    <span className='lx-tag'>{user.phoneNumber || 'Sin teléfono'}</span>
                                </div>,
                                actions: <center>
                                    {event?.organizers?.some((organizer) => organizer.id === user.id)
                                        ? <Button color='danger' size='s' onClick={() => removeOrganizer(user)}>
                                            <Icon name='delete' />
                                            Quitar
                                        </Button>
                                        : <Button color='accent' size='s' onClick={() => addOrganizer(user)}>
                                            <Icon name='add' />
                                            Agregar
                                        </Button>}
                                </center>
                            })}
                            translation={{
                                name: 'Nombre',
                                username: 'Usuario',
                                contact: 'Contacto',
                                document: 'Documento',
                                actions: 'Acciones'
                            }}
                            selectionable={false}
                            selectable={false}
                        />
                    </div>
                }
            />

            <Modal
                show={mode === 'check-in'}
                title={checkInMode
                    ? 'Validando inscripción'
                    : 'Check-in de inscripciones'
                }
                size='standar'
                position='center'
                onClose={() => setMode(null)}

                children={
                    <div style={{ width: '100%', minHeight: '400px', padding: '2rem' }}>
                        {checkInMode
                            ? <Loader loading={true} />
                            : <ScannerQR onResult={handleEnrollmentCheckIn} />}
                    </div>
                }
            />
        </>
    )
}

export default EventDetails