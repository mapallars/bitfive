import './Dashboard.css'
import { timeFormatter, dateFormatter } from '../../../../core/utils/novato.mjs'
import { useAuth } from '../../../../core/contexts/AuthContext'
import Logo from '../../../../core/components/Logo/Logo'

const Dashboard = () => {
    const { session } = useAuth()

    return (session && <>
        <div className='lx-p-dashboard'>
            <div className='lx-p-dashboard-head'>
                <p>{dateFormatter()}</p>
                <h1>{timeFormatter()}, {session.user.name || 'Rewearer'}</h1>
            </div>
            <div className='lx-p-dashboard-body'>
                <Logo color='ghost' size='xxxl' />
            </div>
        </div>
    </>)
}

export default Dashboard