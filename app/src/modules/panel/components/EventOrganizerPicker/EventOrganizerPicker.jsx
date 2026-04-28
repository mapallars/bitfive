import { useState } from 'react'
import Button from '../../../../core/components/Button/Button'
import Modal from '../../../../core/components/Modal/Modal'
import './EventOrganizerPicker.css'

const EventOrganizerPicker = ({ users = [], organizers, setOrganizers }) => {

    const [open, setOpen] = useState(false)

    return (
        <>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title='Asignar organizador'
                description='Selecciona a los organizador del evento'
            >
                <div className='lx-c-event-organizer-picker-modal'>
                    <div className='lx-c-event-organizer-picker-modal-list'>
                        {users.map(user => (
                            <div key={user.id} className='lx-c-event-organizer-picker-modal-item'>
                                <div className='lx-c-event-organizer-picker-modal-item-avatar'>
                                    {user.name[0]}
                                </div>
                                <div className='lx-c-event-organizer-picker-modal-item-info'>
                                    <h3 className='lx-c-event-organizer-picker-modal-item-name'>{user.name}</h3>
                                    <p className='lx-c-event-organizer-picker-modal-item-email'>{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button width='full' size='s'>Asignar</Button>
                </div>
            </Modal>

            <div className='lx-c-event-organizer-picker'>
                <div className='lx-c-event-organizer-picker-header'>
                    <h2 className='lx-c-event-organizer-picker-title'>Organizadores</h2>
                    <p className='lx-c-event-organizer-picker-subtitle'>Selecciona a los organizador del evento</p>
                </div>
                <div className='lx-c-event-organzer-picker-list'>
                    {organizers.map(user => (
                        <div key={user.id} className='lx-c-event-organzer-picker-item'>
                            <div className='lx-c-event-organzer-picker-item-avatar'>
                                {user.name[0]}
                            </div>
                            <div className='lx-c-event-organzer-picker-item-info'>
                                <h3 className='lx-c-event-organzer-picker-item-name'>{user.name}</h3>
                                <p className='lx-c-event-organzer-picker-item-email'>{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button width='full' size='s' onClick={() => setOpen(true)}>Asignar</Button>
            </div>

        </>
    )
}

export default EventOrganizerPicker