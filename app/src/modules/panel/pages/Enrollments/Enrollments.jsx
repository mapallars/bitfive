import './Enrollments.css'
import { useState, useEffect, useCallback } from 'react'
import { useLoad } from '../../../../core/hooks/useLoad'
import EnrollmentRequester from '../../services/EnrollmentRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import Footer from '../../../../core/components/Footer/Footer'
import { useSync } from '../../../../core/hooks/useSync'
import EventsCalendar from '../../components/EventsCalendar/EventsCalendar'
import TabGroup from '../../../../core/components/TabGroup/TabGroup'
import Icon from '../../../../core/components/Icon/Icon'
import EnrollmentCards from '../../components/EnrollmentCards/EnrollmentCards'
import Modal from '../../../../core/components/Modal/Modal'
import ButtonGroup from '../../../../core/components/ButtonGroup/ButtonGroup'
import InputSearch from '../../../../core/components/InputSearch/InputSearch'
import GeneratorQR from '../../components/GeneratorQR/GeneratorQR'
import Details from '../../components/EventDetails/Details'
import DateFormat from '../../../../core/utils/dateFormat.mjs'
import Constant from '../../constants/constant.mjs'
import { EVENT } from '../../constants/event.constant.mjs'

const Enrollments = () => {
    const [tab, setTab] = useState('cards')
    const [status, setStatus] = useState(null)
    const [enrollment, setEnrollment] = useState(null)
    const { state: enrollments, set: setEnrollments } = useSync()
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const enrollments = await EnrollmentRequester.getMyEnrollments()
        setEnrollments(enrollments ?? [])
    }), [withLoad, setEnrollments])

    const filteredEnrollments = status ? enrollments.filter(e => e.enrollmentStatus == status) : enrollments
    const events = enrollments.filter(e => ['CONFIRMED', 'PENDING'].includes(e.enrollmentStatus)).map(e => ({ ...e.event, enrollmentStatus: e.enrollmentStatus }))

    useEffect(() => {
        load()
    }, [load])

    return (
        <>
            <div className='lx-p-enrollments'>
                <Loader loading={loading} background='special' />
                <div className='lx-p-enrollments-header'>
                    <div className='info'>
                        <h1 className='--name'>Mis inscripciones</h1>
                        <p className='--description'>Administra todas tus inscripciones</p>
                        <div className='--overview'>
                            <div className='summary'>
                                {enrollments.length} inscripciones
                            </div>
                        </div>
                    </div>
                </div>
                <div className='lx-p-enrollments-content'>
                    <div className='lx-p-enrollments-actions'>
                        <TabGroup
                            tabs={[
                                <>Tarjetas <Icon name='square' /></>,
                                <>Calendario <Icon name='calendar_month' /></>
                            ]}
                            options={['cards', 'calendar']}
                            onClick={(option) => {
                                setTab(option)
                            }}
                            active={tab}
                        />
                    </div>
                    <div className='lx-p-enrollments-container'>
                        {tab === 'cards' && (
                            <div className='lx-p-enrollments-cards'>
                                <div className='lx-p-enrollments-cards-header'>
                                    <InputSearch context='.lx-c-enrollments-content' element='.lx-c-enrollment-card' />
                                    <ButtonGroup
                                        buttons={['Todas', 'Pendientes', 'Confirmadas', 'Canceladas']}
                                        onClick={(option, index) => {
                                            setStatus(index === 0 ? null : index === 1 ? 'PENDING' : index === 2 ? 'CONFIRMED' : 'CANCELLED')
                                        }}
                                        active={status}
                                    />
                                </div>
                                <div className={`lx-p-enrollments-cards-results --${status}`}><div className='content'>{filteredEnrollments.length} inscripciones {status === 'CONFIRMED' ? 'confirmadas' : status === 'PENDING' ? 'pendientes' : 'en total'}</div></div>
                                <EnrollmentCards enrollments={filteredEnrollments} onView={setEnrollment} />
                            </div>
                        )}
                        {tab === 'calendar' && (
                            <div className='lx-p-enrollments-calendar'>
                                <EventsCalendar
                                    events={events}
                                    onView={(event) => { setEnrollment(enrollments.find(e => e.event?.id === event?.id)) }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>

            <Modal
                show={enrollment}
                title='Inscripción'
                size='max'
                position='center'
                onClose={() => setEnrollment(null)}
                children={
                    <div className='lx-p-enrollments-details'>
                        <div className={`--qr --${enrollment?.enrollmentStatus}`}>
                            <GeneratorQR value={enrollment?.id} />
                        </div>
                        <p className='--description'>Inscripción realizada al evento <i>"{enrollment?.event?.name}"</i> el <strong>{DateFormat.date(enrollment?.date)}</strong> está en estado <span className={`--status --${enrollment?.enrollmentStatus}`}>{Constant.fromValue(EVENT.OPTIONS.ENROLLMENT_STATUS, enrollment?.enrollmentStatus)}</span></p>
                        <Details event={enrollment?.event || null} />
                    </div>
                }
            />
        </>
    )
}

export default Enrollments