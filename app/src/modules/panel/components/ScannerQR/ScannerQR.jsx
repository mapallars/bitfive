import './ScannerQR.css'
import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export const ScannerQR = ({ onResult }) => {
    const scannerRef = useRef(null)

    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: 250 },
                false
            )

            scannerRef.current.render(
                async (decodedText) => {
                    onResult(decodedText)
                }
            )
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner: ", error)
                })
                scannerRef.current = null
            }
        }
    }, [onResult])

    return <div id="reader" />
}

export default ScannerQR