import './Enrollments.css'
import { useState, useEffect, useCallback } from 'react'
import { useLoad } from '../../../../core/hooks/useLoad'
import EnrollmentRequester from '../../services/EnrollmentRequester.mjs'
import Loader from '../../../../core/components/Loader/Loader'
import Footer from '../../../../core/components/Footer/Footer'
import Icon from '../../../../core/components/Icon/Icon'
import Select from '../../../../core/components/Select/Select'
import Timeline from '../../components/Timeline/Timeline'
import { useSync } from '../../../../core/hooks/useSync'

const Enrollments = () => {
    const [selectedStatus, setSelectedStatus] = useState('')
    const { state: enrollments, set: setEnrollments, sync: syncEnrollments } = useSync()
    const { loading, withLoad } = useLoad(true)

    const load = useCallback(() => withLoad(async () => {
        const enrollments = await EnrollmentRequester.getEnrollments()
        setEnrollments(enrollments ?? [])
    }), [withLoad, setEnrollments])

    const filteredEnrollments = selectedStatus ? enrollments.filter(enrollment => enrollment.enrollmentStatus === selectedStatus) : enrollments

    const events = filteredEnrollments.map(enrollment => ({
        ...enrollment.event,
        enrollmentStatus: enrollment.enrollmentStatus,
        enrollmentId: enrollment.id
    }))

    useEffect(() => {
        load()
    }, [load])

    const statusOptions = [
        { value: 'PENDING', key: 'Pendientes' },
        { value: 'CANCELLED', key: 'Canceladas' },
        { value: 'CONFIRMED', key: 'Confirmadas' }
    ]

    return (
        <div className='lx-p-enrollments'>
            <Loader loading={loading} background='special' />

            <div className='lx-p-enrollments-header'>
                <div className='lx-p-enroll-events-header-content'>
                    <h1 className='lx-p-enrollments-title'>Mis Inscripciones</h1>
                    <p className='lx-p-enrollments-description'>
                        Gestiona tus inscripciones a eventos
                    </p>
                </div>
            </div>

            <div className='lx-p-enrollments-content'>
                <div className='lx-p-enrollments-container'>
                    <div className='lx-p-enrollments-section'>
                        <div className='lx-p-enrollments-section-header'>
                            <div className='lx-p-enrollments-section-header-info'>
                                <h2 className='lx-p-enrollments-section-title'>Inscripciones</h2>
                                <p className='lx-p-enrollments-section-description'>
                                    Consulta tus inscripciones por estado
                                </p>
                            </div>
                            <div className='lx-p-enrollments-filter'>
                                <div className='lx-p-enrollments-filter-icon'>
                                    <Icon name='instant_mix' size='m' />
                                </div>
                                <Select
                                    label="Filtrar por estado"
                                    options={statusOptions}
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                />
                            </div>
                        </div>
                        <Timeline events={events} onView={() => {}} />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Enrollments