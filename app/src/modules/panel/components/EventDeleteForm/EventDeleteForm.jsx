import './EventDeleteForm.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import EventRequester from '../../services/EventRequester.mjs'

const EventDeleteForm = ({ event, handler = () => { }, onCancel = () => { } }) => {
    const { name = '' } = event || {}

    const submit = async () => {
        const result = await EventRequester.deleteEvent(event)
        if (result) {
            handler({ id: event.id })
        }
        else {
            onCancel()
        }
    }

    return (<div className='lx-f-event-delete'>
        <div className='icon'>
            <Icon name='warning' size='xxxl' className='lx-text-color-danger' />
        </div>
        <p className='message'>¿Estás seguro de que deseas eliminar el evento <strong>{name}</strong>?</p>
        <div className='actions'>
            <Button size='s' width='full' color='danger' onClick={submit}>Eliminar</Button>
            <Button size='s' width='full' color='auto' variant='bordered' onClick={onCancel}>Cancelar</Button>
        </div>
    </div>)
}

export default EventDeleteForm