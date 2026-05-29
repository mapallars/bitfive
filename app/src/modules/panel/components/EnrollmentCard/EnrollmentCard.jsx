import './EnrollmentCard.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import DateFormat from '../../../../core/utils/dateFormat.mjs'

const EnrollmentCard = ({ enrollment, onView = () => { } }) => {

    const {
        name = '',
        price,
        location = 'Sin ubicación',
        color,
        isActive,
        startAt,
        endAt
    } = enrollment.event

    const StatusIcon = {
        'PENDING': 'assignment',
        'CONFIRMED': 'check',
        'CANCELLED': 'cancel'
    }

    const StatusText = {
        'PENDING': 'Pendiente',
        'CONFIRMED': 'Confirmada',
        'CANCELLED': 'Cancelada'
    }

    return (<div className={`lx-c-enrollment-card --${isActive ? 'active' : 'inactive'}`} onClick={() => onView(enrollment)} style={{ '--lx-c-enrollment-card-color': color }}>

        <div className={`lx-c-enrollment-card-status --${enrollment.enrollmentStatus}`}>
            <div className='lx-c-enrollment-card-status-icon'>
                <Icon name={StatusIcon[enrollment.enrollmentStatus]} size='s' />
            </div>
            <div className='lx-c-enrollment-card-status-text'>
                {StatusText[enrollment.enrollmentStatus]}
            </div>
        </div>

        <div className='lx-c-enrollment-card-head'>
            <div className='lx-c-enrollment-card-cover'>
                {name}
            </div>
        </div>
        <div className='lx-c-enrollment-card-content'>

            <div className='lx-c-enrollment-card-summary'>
                <div className='lx-c-enrollment-card-price'>{price ? <span className='--price'>{price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} COP</span> : <span className='--free'>Gratis</span>}</div>
                <div className='lx-c-enrollment-card-name'>{name}</div>
                <div className='lx-c-enrollment-card-location'>{location}</div>
            </div>

            <div className='lx-c-enrollment-card-dates'>
                {startAt ? <div className='--start'>
                    <p className='--label'>Inicio</p>
                    <p className='--date'>{DateFormat.short(startAt)}</p>
                    <p className='--time'>{DateFormat.time(startAt)}</p>
                </div> : <div className='--start'>
                    <p className='--label'>Inicio</p>
                    <p className='--date'>Indefinido</p>
                </div>}
                <div className='--icon'>
                    <Icon name='event_upcoming' size='s' />
                </div>
                {endAt ? <div className='--end'>
                    <p className='--label'>Fin</p>
                    <p className='--date'>{DateFormat.short(endAt)}</p>
                    <p className='--time'>{DateFormat.time(endAt)}</p>
                </div> : <div className='--end'>
                    <p className='--label'>Fin</p>
                    <p className='--date'>Indefinido</p>
                </div>}
            </div>

            <div className='footer'>
                <Button size='s' color='auto' width='full' onClick={() => onView(enrollment)}><Icon name='visibility' /> Ver inscripción</Button>
            </div>
        </div>
    </div>)
}

export default EnrollmentCard