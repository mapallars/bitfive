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
import Details from './Details.jsx'

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
                            <Details event={event} />
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