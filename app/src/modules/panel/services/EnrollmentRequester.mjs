import API from '../../../core/config/api.config.mjs';
import Notify from '../../../core/lib/notify.mjs';
import Requester from '../../../core/services/service/Requester.mjs';

class EnrollmentRequester extends Requester {

    static async getEnrollments() {
        const result = await super.get(API.ENROLLMENT.ENDPOINTS.ENROLLMENTS)
        return result.data
    }

    static async getEnrollmentsById(id) {
        const result = await super.get(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${id}`)
        return result.data
    }

    static async getEnrollmentsByUser(userId) {
        const result = await super.get(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${userId}`)
        return result.data
    }

    static async getEnrollmentsByEvent(eventId) {
        const result = await super.get(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${eventId}`)
        return result.data
    }

    static async createEnrollment(enrollment) {
        const result = await super.post(API.ENROLLMENT.ENDPOINTS.ENROLLMENTS, enrollment)
        return result.data
    }

    static async updateEnrollment(enrollment) {
        const result = await super.put(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${enrollment.id}`, enrollment)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo actualizar la inscripcion',
                result.ok ? 'info' : 'error'
            )
        }

        return result.data
    }

    static async deleteEnrollment(enrollment) {
        const result = await super.delete(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${enrollment.id}`)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo eliminar la inscripcion',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok
    }

    static async cancelEnrollment(enrollment) {
        const result = await super.delete(`${API.ENROLLMENT.ENDPOINTS.ENROLLMENTS}${enrollment.id}/cancel`)

        if (result.message) {
            Notify.notice(
                result.message || 'No se pudo cancelar la inscripcion',
                result.ok ? 'info' : 'error'
            )
        }

        return result.ok
    }

}

export default EnrollmentRequester