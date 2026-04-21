import Logo from '../Logo/Logo'
import './Loader.css'

const Loader = ({ loading = true, color = 'auto', background = 'primary', animated = true, logo = true }) => {
    return (<>
        <div className={`lx-c-loader ${loading ? '--active' : '--inactive'} --${background} ${animated ? '--animated' : '--static'}`}>
            {logo ? <Logo size='s' className='lx-c-loader-spin' /> : <div className={`lx-c-loader-spinner --${color}`} />}
        </div>
    </>)
}

export default Loader