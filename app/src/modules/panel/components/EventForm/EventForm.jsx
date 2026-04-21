import './EventForm.css'
import { useForm } from '../../../../core/hooks/useForm'
import Validator from '../../../../core/utils/validator.mjs'
import Button from '../../../../core/components/Button/Button'
import InputGroup from '../../../../core/components/InputGroup/InputGroup'
import Input from '../../../../core/components/Input/Input'
import Textarea from '../../../../core/components/Textarea/Textarea'
import EventRequester from '../../services/EventRequester.mjs'
import Icon from '../../../../core/components/Icon/Icon'
import Logo from '../../../../core/components/Logo/Logo'
import Switch from '../../../../core/components/Switch/Switch'
import Select from '../../../../core/components/Select/Select'
import { EVENT } from '../../constants/event.contants'

const EventForm = ({ event, onCancel = () => { }, handler = (result) => { } }) => {

    const {
        form,
        setForm,
        resetForm,
        errors,
        setErrors,
        handleChange
    } = useForm(event || EVENT.FORM.INITIAL)

    const validator = new Validator({ prefix: 'Event', errorHandler: setErrors })

    const validate = () => {
        const { name, description, timezone, location, maxCapacity, price, cover, eventStatus, color, category, visibility, type, startAt, endAt } = form
        return validator.every([
            ['Category', () => validator.set({ category }).required().length(2, 100)],
            ['Visibility', () => validator.set({ visibility }).required().isIn(EVENT.OPTIONS.VISIBILITY.map(v => v.value))],
            ['Color', () => validator.set({ color }).required()],
            ['Name', () => validator.set({ name }).required().length(2, 100)],
            ['StartAt', () => validator.set({ startAt }).required()],
            ['EndAt', () => validator.set({ endAt }).required()],
            ['Description', () => validator.set({ description }).required().length(1, 500)],
            ['Type', () => validator.set({ type }).required().isIn(EVENT.OPTIONS.TYPE.map(v => v.value))],
            ['Location', () => validator.set({ location }).required().length(2, 100)],
            ['MaxCapacity', () => validator.set({ maxCapacity }).required()],
            ['Price', () => validator.set({ price }).required()],
            ['Cover', () => validator.set({ cover }).required()],
            ['Timezone', () => validator.set({ timezone }).required()],
            ['EventStatus', () => validator.set({ eventStatus }).required().isIn(EVENT.OPTIONS.EVENT_STATUS.map(v => v.value))],
        ], 'Event')
    }

    const submit = async (e) => {
        e.preventDefault()

        if (!validate()) return

        const result = event
            ? await EventRequester.updateEvent(form)
            : await EventRequester.createEvent(form)

        if (result) {
            handler(result)
        }
    }

    return (
        <div className='lx-f-event-container' style={{ '--lx-f-event-color': form.color }}>

            <div className="lx-f-event-header">
                <Button color='auto' variant='bordered' icon onClick={onCancel}>
                    <Icon name='arrow_back' />
                </Button>
                <h2 className='lx-f-event-title'>
                    {event ? 'Editar' : 'Crear'} evento
                </h2>
            </div>

            <div className="lx-f-event-body">

                <div className="lx-f-event-cover-container">
                    <div className="lx-f-event-cover">
                        {form.name || <Logo colored={form.color} />}
                    </div>
                </div>

                <form className='lx-f-event'>


                    <InputGroup>
                        <div className='lx-f-event-section-header'>
                            <strong className='lx-f-event-section-title'>1. General</strong>
                            <p className='lx-f-event-section-subtitle'>Completa la información del general</p>
                        </div>
                        <InputGroup columns={3}>
                            <Input
                                required
                                id='EventCategory'
                                name='category'
                                label='Categoría'
                                type='text'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.category}
                                onChange={handleChange}
                                error={errors.category}
                            />
                            <br />
                            <Select
                                required
                                id='EventVisibility'
                                name='visibility'
                                label='Visibilidad'
                                autoComplete='off'
                                options={EVENT.OPTIONS.VISIBILITY}
                                value={form.visibility}
                                onChange={handleChange}
                                error={errors.visibility}
                            />
                        </InputGroup>
                        <InputGroup columns={2} mode='min-max'>
                            <Input
                                required
                                id='EventColor'
                                name='color'
                                label='Color'
                                type='color'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.color}
                                onChange={handleChange}
                                error={errors.color}
                            />
                            <Input
                                required
                                id='EventName'
                                name='name'
                                label='Nombre'
                                type='text'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                        </InputGroup>
                        <InputGroup columns={2}>
                            <Input
                                required
                                id='EventStartAt'
                                name='startAt'
                                label='Fecha de inicio'
                                type='datetime-local'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.startAt}
                                onChange={handleChange}
                                error={errors.startAt}
                            />
                            <Input
                                required
                                id='EventEndAt'
                                name='endAt'
                                label='Fecha de fin'
                                type='datetime-local'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.endAt}
                                onChange={handleChange}
                                error={errors.endAt}
                            />
                        </InputGroup>
                        <Textarea
                            required
                            id='EventDescription'
                            name='description'
                            label='Descripción'
                            type='text'
                            autoComplete='off'
                            minLength={2}
                            maxLength={100}
                            value={form.description}
                            onChange={handleChange}
                            error={errors.description}
                        />
                        <br />
                        <div className='lx-f-event-section-header'>
                            <strong className='lx-f-event-section-title'>2. Modalidad</strong>
                            <p className='lx-f-event-section-subtitle'>Completa la información de la modalidad</p>
                        </div>
                        <InputGroup columns={2} mode='min-max'>
                            <Select
                                required
                                id='EventType'
                                name='type'
                                label='Tipo'
                                autoComplete='off'
                                options={EVENT.OPTIONS.TYPE}
                                value={form.type}
                                onChange={handleChange}
                                error={errors.type}
                            />
                            <Input
                                required
                                id='EventLocation'
                                name='location'
                                label='Ubicación'
                                type='text'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.location}
                                onChange={handleChange}
                                error={errors.location}
                            />
                        </InputGroup>
                        <InputGroup columns={2}>
                            <Input
                                required
                                id='EventMaxCapacity'
                                name='maxCapacity'
                                label='Capacidad máxima'
                                type='number'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.maxCapacity}
                                onChange={handleChange}
                                error={errors.maxCapacity}
                            />
                            <Input
                                required
                                id='EventPrice'
                                name='price'
                                label='Precio'
                                type='number'
                                autoComplete='off'
                                minLength={2}
                                maxLength={100}
                                value={form.price}
                                onChange={handleChange}
                                error={errors.price}
                            />
                        </InputGroup>
                        <br />
                        <div className='lx-f-event-section-header'>
                            <strong className='lx-f-event-section-title'>3. Otros ajustes</strong>
                            <p className='lx-f-event-section-subtitle'>Completa la información de los otros ajustes</p>
                        </div>
                        <Input
                            required
                            id='EventCover'
                            name='cover'
                            label='Portada'
                            type='text'
                            autoComplete='off'
                            minLength={2}
                            maxLength={100}
                            value={form.cover}
                            onChange={handleChange}
                            error={errors.cover}
                        />
                        <Select
                            required
                            id='EventTimezone'
                            name='timezone'
                            label='Zona horaria'
                            autoComplete='off'
                            options={EVENT.OPTIONS.TIMEZONE}
                            value={form.timezone}
                            onChange={handleChange}
                            error={errors.timezone}
                        />
                        <Select
                            required
                            id='EventEventStatus'
                            name='eventStatus'
                            label='Estado'
                            autoComplete='off'
                            options={EVENT.OPTIONS.EVENT_STATUS}
                            value={form.eventStatus}
                            onChange={handleChange}
                            error={errors.eventStatus}
                        />
                    </InputGroup>
                    <div className='lx-f-evenet-section-header'>
                        <strong className='lx-f-event-section-title'>4. Parqueadero</strong>
                        <p className='lx-f-event-section-subtitle'>Marca el siguiente campo si el evento tiene parqueadero</p>
                    </div>
                    <Switch
                        checked={form.hasParking}
                        action={(setCheck) => {
                            setForm((prev) => ({
                                ...prev,
                                hasParking: !prev.hasParking
                            }))
                            setCheck((prev) => !prev)
                        }}
                    />
                    <div className='lx-f-event-actions'>
                        <Button variant='bordered' color='auto' width='full' onClick={onCancel}>Cancelar</Button>
                        <Button width='full' onClick={submit}>{event ? 'Guardar cambios' : 'Crear evento'}</Button>
                    </div>
                </form>

            </div>

        </div>
    )
}

export default EventForm