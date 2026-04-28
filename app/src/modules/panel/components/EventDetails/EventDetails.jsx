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

const EventDetails = ({ event: _event, onBack, onEdit, onDelete }) => {
    const [event, setEvent] = useState(_event)
    const [mode, setMode] = useState(null)
    const [tab, setTab] = useState('details')
    const [users, setUsers] = useState([])
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const users = await AuthRequester.getUsers()
        setUsers(users ?? [])
    }), [withLoad, setUsers])

    useEffect(() => {
        console.log('event', event)
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
                        <Button color='auto' size='s' onClick={() => onEdit(event)}>
                            <Icon name='edit' />
                            Editar
                        </Button>
                        <Button color='danger' size='s' onClick={() => onDelete(event)}>
                            <Icon name='delete' />
                            Eliminar
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
                            <div className='lx-c-event-details-info-wrapper'>
                                <div className='lx-c-event-details-info'>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='category' />
                                            Categoría
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.category || 'Sin categoría'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='event_available' />
                                            Estado del evento
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {Constant.fromValue(EVENT.OPTIONS.EVENT_STATUS, event.eventStatus) || 'No definido'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='location_on' />
                                            Ubicación
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.location || 'Sin ubicación'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='calendar_today' />
                                            Inicio
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.startAt ? DateFormat.string(event.startAt) : 'No definido'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='event' />
                                            Finalización
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.endAt ? DateFormat.string(event.endAt) : 'No definido'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='schedule' />
                                            Zona horaria
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {Constant.fromValue(EVENT.OPTIONS.TIMEZONE, event.timezone) || event.timezone || 'No definida'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='apartment' />
                                            Tipo
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {Constant.fromValue(EVENT.OPTIONS.TYPE, event.type) || 'No definido'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='group' />
                                            Capacidad máxima
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.maxCapacity || 'Ilimitada'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='local_parking' />
                                            Estacionamiento
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.hasParking ? 'Disponible' : 'No disponible'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='payments' />
                                            Precio
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {event.price ? `$${event.price}` : 'Gratis'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='visibility' />
                                            Visibilidad
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            {Constant.fromValue(EVENT.OPTIONS.VISIBILITY, event.visibility) || 'Pública'}
                                        </div>
                                    </div>
                                    <div className='lx-c-event-details-info-card'>
                                        <div className='lx-c-event-details-info-card-header'>
                                            <Icon name='toggle_on' />
                                            Estado
                                        </div>
                                        <div className='lx-c-event-details-info-card-value'>
                                            <SatatusTag status={event.isActive} message={event.isActive ? 'Activo' : 'Inactivo'} />
                                        </div>
                                    </div>
                                </div>
                                <div className='lx-c-event-details-info-description'>
                                    <div className='lx-c-event-details-info-card-header'>
                                        <Icon name='description' />
                                        Descripción
                                    </div>
                                    <p className='lx-text-color-soft' style={{ whiteSpace: 'pre-wrap' }}>{event.description || 'Este evento no tiene una descripción detallada.'}</p>
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
                                    objects={event?.organizers}
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
                                />
                            </>
                        )}
                        {tab === 'enrollments' && (
                            <>
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
                                            <span className='lx-c-event-details-enrollment-status'>{Constant.fromValue(EVENT.OPTIONS.ENROLLMENT_STATUS, enrollment.enrollmentStatus)}</span>
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
                        <p className='lx-text-color-softer'>Agrega usuarios como organizadores del evento "{event.name}".</p>
                        <br />
                        <Table
                            objects={users}
                            mapper={(user, index) => ({
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
                                    {event.organizers.some((organizer) => organizer.id === user.id)
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
        </>
    )
}

export default EventDetails