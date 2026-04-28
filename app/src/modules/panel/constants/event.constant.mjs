export const EVENT = {
    FORM: {
        INITIAL: {
            name: '',
            description: '',
            category: '',
            cover: '',
            color: '#ff4400ff',
            location: '',
            startAt: '',
            endAt: '',
            timezone: '',
            type: '',
            visibility: '',
            eventStatus: '',
            maxCapacity: 0,
            hasParking: false,
            price: 0
        }
    },
    OPTIONS: {
        VISIBILITY: [
            {
                key: 'Público',
                value: 'PUBLIC'
            },
            {
                key: 'Privado',
                value: 'PRIVATE',
            }
        ],
        TYPE: [
            {
                key: 'Presencial',
                value: 'IN_PERSON'
            },
            {
                key: 'Virtual',
                value: 'VIRTUAL',
            }
        ],
        EVENT_STATUS: [
            {
                key: 'Disponible',
                value: 'AVAILABLE'
            },
            {
                key: 'Cancelado',
                value: 'CANCELLED',
            },
            {
                key: 'Finalizado',
                value: 'FINISHED',
            }
        ],
        TIMEZONE: [
            {
                key: 'America/Lima',
                value: 'America/Lima'
            },
            {
                key: 'America/Bogota',
                value: 'America/Bogota'
            }
        ],
        ENROLLMENT_STATUS: [
            {
                key: 'Confirmado',
                value: 'CONFIRMED'
            },
            {
                key: 'Pendiente',
                value: 'PENDING',
            },
            {
                key: 'Cancelado',
                value: 'CANCELLED',
            }
        ]
    }
}