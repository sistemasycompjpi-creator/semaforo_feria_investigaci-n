// Componente para Dashboard - tamaño completo
export const InstitutionalHeaderLarge = () => {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-xl">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-center gap-6">
                    {/* Logos alineados con jerarquía de izquierda a derecha */}
                    <div className="flex items-center gap-6">
                        {/* Logo 1 - ITM (más importante, izquierda) */}
                        <img
                            src="1-itm_logo.png"
                            alt="ITM Logo"
                            className="h-16 w-auto object-contain"
                        />

                        {/* Logo 2 - DSC */}
                        <img
                            src="2-dsc_logo.png"
                            alt="DSC Logo"
                            className="h-14 w-auto object-contain"
                        />

                        {/* Logo 3 - ISC */}
                        <img
                            src="3-isc_logo.png"
                            alt="ISC Logo"
                            className="h-14 w-auto object-contain"
                        />

                        {/* Logo 4 - JPI */}
                        <img
                            src="4-jpi_logo.png"
                            alt="JPI Logo"
                            className="h-14 w-auto object-contain"
                        />

                        {/* Logo 5 - FPI (menos importante, derecha) */}
                        <img
                            src="5-fpi_logo.png"
                            alt="FPI Logo"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente compacto para usar dentro del contenido (Semáforo)
export const InstitutionalLogosCompact = () => {
    return (
        <div className="flex items-center justify-center gap-5 py-2">
            {/* Logo 1 - ITM */}
            <img
                src="/1-itm_logo.png"
                alt="ITM Logo"
                className="h-14 w-auto object-contain"
            />

            {/* Logo 2 - DSC */}
            <img
                src="/2-dsc_logo.png"
                alt="DSC Logo"
                className="h-14 w-auto object-contain"
            />

            {/* Logo 3 - ISC */}
            <img
                src="/3-isc_logo.png"
                alt="ISC Logo"
                className="h-14 w-auto object-contain"
            />

            {/* Logo 4 - JPI */}
            <img
                src="/4-jpi_logo.png"
                alt="JPI Logo"
                className="h-14 w-auto object-contain"
            />

            {/* Logo 5 - FPI */}
            <img
                src="/5-fpi_logo.png"
                alt="FPI Logo"
                className="h-14 w-auto object-contain"
            />
        </div>
    );
};

// Exportación por defecto mantiene compatibilidad
const InstitutionalHeader = InstitutionalHeaderLarge;
export default InstitutionalHeader;
