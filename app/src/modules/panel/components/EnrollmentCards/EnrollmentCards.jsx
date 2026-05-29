import './EnrollmentCards.css'
import EnrollmentCard from '../EnrollmentCard/EnrollmentCard.jsx'
import Empity from '../../../../core/components/Empity/Empity'

const EnrollmentCards = ({ enrollments = [], onView = () => { } }) => {
    const count = enrollments.length || 0

    return (<div className='lx-c-enrollments'>
        {count > 0
            ? <div className='lx-c-enrollments-content'>
                {enrollments.map(enrollment => <EnrollmentCard key={enrollment.id} enrollment={enrollment} onView={onView} />)}
            </div>
            : <Empity icon='assignment' message='No hay inscripciones registradas en el sistema' />
        }
    </div>)
}

export default EnrollmentCards