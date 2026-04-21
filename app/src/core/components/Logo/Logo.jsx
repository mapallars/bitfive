import './Logo.css'

function Logo({ size, color, colored, href, className }) {

    const _color = colored ? colored : `var(--lx-color-${['accent', 'auto', 'ghost', 'black', 'white', 'gray', 'success', 'warning', 'danger'].includes(color) ? color : 'accent'})`

    function click(href) {
        if (href) console.log(href)
    }

    return (
        <>
            <div className={`${className} lx-c-logo lx-c-logo-size-${['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].includes(size) ? size : 'm'}`} onClick={() => { click(href) }}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 1000 1000"><path d="M206 109.1V304c0 54.124-43.876 98-98 98h-.002A98 98 0 0 0 10 499.998V890.9c0 54.731 44.369 99.1 99.1 99.1h391.21c53.984 0 97.778-43.705 97.886-97.69v-.016l.001-.345c.162-53.896 43.856-97.525 97.753-97.606l98.32-.148h.05l96.68-.097c54.693-.055 99.001-44.407 99.001-99.1V303.689c0-53.984-43.705-97.778-97.69-97.886h-.016l-.491-.001c-53.839-.162-97.443-43.767-97.605-97.605l-.001-.491v-.202C794.09 53.622 750.38 10 696.498 10H305.102a99.1 99.1 0 0 0-99.1 99.1Zm588 196v195.21a97.494 97.494 0 0 1-97.69 97.494h-.016l-.492-.001c-53.839-.162-97.443-43.766-97.605-97.605l-.001-.344v-.346c-.108-53.915-43.788-97.596-97.704-97.704h-.346l-1.147-.003c-53.395-.161-96.641-43.405-96.803-96.8v-.021c-.097-52.825-.001-96.635.289-97.789l.006-.017c.343-.881 40.57-1.175 195.999-1.175h96.41a99.1 99.1 0 0 1 99.1 99.1ZM402 499.998V500c0 54.124-43.876 98-98 98h-.002A98 98 0 0 1 206 500.002v-.004A98 98 0 0 1 303.998 402h.004A98 98 0 0 1 402 499.998m196 195.51v.802a97.494 97.494 0 0 1-97.69 97.494h-.016l-1.292-.004c-53.396-.161-96.643-43.406-96.806-96.802v-.018c-.098-52.851-.001-96.679.29-97.791l.006-.016c.339-.88 20.959-1.173 97.998-1.173h.002A97.51 97.51 0 0 1 598 695.508" fill={_color} fillRule="nonzero" /></svg>
            </div>
        </>
    )
}

export default Logo
