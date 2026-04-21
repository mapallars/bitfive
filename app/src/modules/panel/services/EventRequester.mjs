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
        return result.data
    }

    static async updateEvent(event) {
        const result = await super.put(`${API.EVENT.ENDPOINTS.EVENTS}/${event.eventname}`, event)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo actualizar el evento',
                result.ok ? 'info' : 'error'
            )
        }

        return result.data
    }

    static async deleteEvent(event) {
        const result = await super.delete(`${API.EVENT.ENDPOINTS.EVENTS}/${event.eventname}`)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo eliminar el evento',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok
    }

}

export default EventRequester