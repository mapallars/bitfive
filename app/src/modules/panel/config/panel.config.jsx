import Dashboard from '../pages/Dashboard/Dashboard'
import Users from '../pages/Users/Users'
import Authorization from '../pages/Authorization/Authorization'
import Events from '../pages/Events/Events'
import Enrollments from '../pages/Enrollments/Enrollments'
import Parkings from '../pages/Parkings/Parkings'

export const AUTHORITIES = {
  PANEL: {
    roles: []
  }
}

export const MENU = [
  {
    label: 'Descubrir',
    icon: 'explore',
    description: 'Resumen general del sistema',
    to: '',
    path: '',
    isBase: true,
    element: <Dashboard />,
    authorities: {
      permissions: ['AccessDashboard']
    },
    items: []
  },
  {
    label: 'Autorizaciones',
    icon: 'shield_toggle',
    description: 'Gestión de roles y permisos',
    to: 'authorization',
    path: 'authorization',
    element: <Authorization />,
    authorities: {
      permissions: ['AccessAuthorization']
    },
    items: []
  },
  {
    label: 'Usuarios',
    icon: 'shield_person',
    description: 'Gestión de cuentas de usuarios',
    to: 'users',
    path: 'users/:userId?',
    element: <Users />,
    authorities: {
      permissions: ['AccessUsers']
    },
    items: []
  },
  {
    label: 'Parqueaderos',
    icon: 'parking_sign',
    description: 'Gestión de parqueaderos',
    to: 'parkings',
    path: 'parkings/:parkingId?',
    element: <Parkings />,
    authorities: {
      permissions: ['AccessParkings']
    },
    items: []
  },
  {
    label: 'Mis eventos',
    icon: 'event',
    description: 'Gestión de eventos',
    to: 'events',
    path: 'events/:eventId?',
    element: <Events />,
    authorities: {
      permissions: ['AccessEvents']
    },
    items: []
  },
  {
    label: 'Mis inscripciones',
    icon: 'event_seat',
    description: 'Gestión de inscripciones a eventos',
    to: 'enrollments',
    path: 'enrollments/:enrollmentId?',
    element: <Enrollments />,
    authorities: {
      permissions: ['AccessEnrollments']
    },
    items: []
  }
]
