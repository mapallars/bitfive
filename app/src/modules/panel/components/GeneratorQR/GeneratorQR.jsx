import { useEffect, useState } from 'react'
import Loader from '../../../../core/components/Loader/Loader'

const GeneratorQR = ({ value }) => {
    const [qrUrl, setQrUrl] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!value || value.trim() === '') {
            setQrUrl('')
            return
        }
        setLoading(true)
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            value
        )}`

        const img = new Image()

        img.src = url

        img.onload = () => {
            setQrUrl(url)
            setLoading(false)
        }

        img.onerror = () => {
            setLoading(false)
        }
    }, [value])

    return (
        <div>
            {!value ? (
                <p>Ingresa un valor para generar el QR.</p>
            ) : loading ? (
                <Loader />
            ) : (
                <img
                    src={qrUrl}
                    alt='Código QR'
                    style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 'var(--lx-border-radius-s)',
                        objectFit: 'cover',
                    }}
                />
            )}
        </div>
    )
}

export default GeneratorQR