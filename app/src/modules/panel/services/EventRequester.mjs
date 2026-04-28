import API from '../../../core/config/api.config.mjs';
import Notify from '../../../core/lib/notify.mjs';
import Requester from '../../../core/services/service/Requester.mjs';

class EventRequester extends Requester {

    static async getEvents() {
        const result = await super.get(API.EVENT.ENDPOINTS.EVENTS)
        return result.data
    }

    static async getMyEvents() {
        const result = await super.get(API.EVENT.ENDPOINTS.MY_EVENTS)
        return result.data
    }

    static async createEvent(event) {
        const result = await super.post(API.EVENT.ENDPOINTS.EVENTS, event)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo crear el evento',
                result.ok ? 'info' : 'error'
            )
        }

        return result.data
    }

    static async updateEvent(event) {
        const result = await super.put(`${API.EVENT.ENDPOINTS.EVENTS}${event.id}`, event)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo actualizar el evento',
                result.ok ? 'info' : 'error'
            )
        }

        return result.data
    }

    static async deleteEvent(event) {
        const result = await super.delete(`${API.EVENT.ENDPOINTS.EVENTS}${event.id}`)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo eliminar el evento',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok
    }

    static async addOrganizer(event, organizer) {
        const result = await super.post(`${API.EVENT.ENDPOINTS.EVENTS}${event.id}/organizers`, {
            organizerId: organizer.id
        })

        if (result.ok) {
            Notify.notice(
                `Organizador "${organizer.name}" agregado`,
                'success'
            )
        }

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo agregar el organizador',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok ? result.data : event
    }

    static async removeOrganizer(event, organizer) {
        const result = await super.delete(`${API.EVENT.ENDPOINTS.EVENTS}${event.id}/organizers`, {
            data: { organizerId: organizer.id }
        })

        if (result.ok) {
            Notify.notice(
                `Organizador "${organizer.name}" quitado`,
                'success'
            )
        }

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo eliminar el organizador',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok ? result.data : event
    }

}

export default EventRequester