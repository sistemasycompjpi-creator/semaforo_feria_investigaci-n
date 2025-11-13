import { useParams, Link } from "react-router";
import { ArrowLeft, Play, Pause, RotateCcw, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { proyectosAPI } from "../backend/api/proyectos";
import type { ProyectoConAsesores } from "../backend/schemas";
import { useSemaforo } from "../contexts/SemaforoContext";

type TimerPhase = 'idle' | 'green' | 'yellow' | 'red' | 'deliberacion' | 'limpieza' | 'finished' | 'aviso';

const Semaforo = () => {
    const { mode } = useParams();
    const { showCustomModal, setShowCustomModal } = useSemaforo();
    const [showModal, setShowModal] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProyectoConAsesores | null>(null);
    const [proyectos, setProyectos] = useState<ProyectoConAsesores[]>([]);

    useEffect(() => {
        if (mode !== 'custom') {
            const datos = proyectosAPI.getAll(mode as 'protocolo' | 'informe');
            setProyectos(datos);
        }
    }, [mode]);

    const [customData, setCustomData] = useState<{
        tema: string;
        lider: string;
        noControlLider: string;
        companero: string;
        noControlCompanero: string;
        semaforo: number[];
        deliberacion: number;
        limpieza: number;
    } | null>(null);

    // Estados del timer
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<TimerPhase>('idle');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const intervalRef = useRef<number | null>(null);

    // Estados para el formulario custom
    const [customForm, setCustomForm] = useState({
        tema: '',
        lider: '',
        noControlLider: '',
        companero: '',
        noControlCompanero: '',
        verde: 5,
        amarillo: 2,
        rojo: 1,
        deliberacion: 5,
        limpieza: 3
    });

    // Configuración de tiempos según modalidad
    const tiemposConfig = {
        protocolo: { semaforo: [7, 2, 1], deliberacion: 6, limpieza: 4 },
        informe: { semaforo: [7, 2, 1], deliberacion: 6, limpieza: 4 },
    };

    const getTiempos = () => {
        if (mode === "custom" && customData) {
            return customData;
        }
        return tiemposConfig[mode as keyof typeof tiemposConfig] || tiemposConfig.protocolo;
    };

    const tiempos = getTiempos();

    // Función para reproducir sonido
    const playSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const context = new AudioContextClass();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.frequency.value = 800;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
        } catch {
            console.log("Audio not supported");
        }
    };

    // Controles del temporizador
    const startTimer = () => {
        if (!isRunning) {
            if (currentPhase === 'idle' || currentPhase === 'finished') {
                setCurrentPhase('green');
                setTimeRemaining((tiempos.semaforo[0]) * 60);
            }
            setIsRunning(true);
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const restartTimer = () => {
        setIsRunning(false);
        setCurrentPhase('idle');
        setTimeRemaining(0);
    };

    // Función para formatear tiempo MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // useEffect para manejar el countdown
    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Tiempo terminado, cambiar de fase
                        playSound();

                        if (currentPhase === 'green') {
                            setCurrentPhase('yellow');
                            return (tiempos.semaforo[1]) * 60;
                        } else if (currentPhase === 'yellow') {
                            setCurrentPhase('red');
                            return (tiempos.semaforo[2]) * 60;
                        } else if (currentPhase === 'red') {
                            setCurrentPhase('aviso');
                            return 10;
                        } else if (currentPhase === 'aviso') {
                            setCurrentPhase('deliberacion');
                            return (tiempos.deliberacion) * 60;
                        } else if (currentPhase === 'deliberacion') {
                            setCurrentPhase('limpieza');
                            const newLimpiezaTime = (tiempos.limpieza * 60) - 10;
                            return newLimpiezaTime > 0 ? newLimpiezaTime : 0;
                        } else if (currentPhase === 'limpieza') {
                            setCurrentPhase('finished');
                            setIsRunning(false);
                            return 0;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (!isRunning && timeRemaining !== 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        } else if (timeRemaining === 0 && isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Lógica para cambiar de fase cuando el tiempo llega a 0
            if (currentPhase === 'green') {
                setCurrentPhase('yellow');
                setTimeRemaining((tiempos.semaforo[1]) * 60);
            } else if (currentPhase === 'yellow') {
                setCurrentPhase('red');
                setTimeRemaining((tiempos.semaforo[2]) * 60);
            } else if (currentPhase === 'red') {
                setCurrentPhase('aviso');
                setTimeRemaining(10);
            } else if (currentPhase === 'aviso') {
                setCurrentPhase('deliberacion');
                setTimeRemaining((tiempos.deliberacion) * 60);
            } else if (currentPhase === 'deliberacion') {
                setCurrentPhase('limpieza');
                const newLimpiezaTime = (tiempos.limpieza * 60) - 10;
                setTimeRemaining(newLimpiezaTime > 0 ? newLimpiezaTime : 0);
            } else if (currentPhase === 'limpieza') {
                setCurrentPhase('finished');
                setIsRunning(false);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeRemaining, currentPhase, tiempos]);

    // Determinar el color activo del semáforo
    const getLightColor = () => {
        if (currentPhase === 'green') return 'green';
        if (currentPhase === 'yellow') return 'yellow';
        if (currentPhase === 'red') return 'red';
        if (currentPhase === 'aviso') return 'cyan';
        if (currentPhase === 'deliberacion') return 'purple';
        if (currentPhase === 'limpieza') return 'blue';
        return 'gray';
    };

    const lightColor = getLightColor();

    const getPhaseTitle = () => {
        if (currentPhase === 'green' || currentPhase === 'yellow' || currentPhase === 'red') {
            return 'Presentación';
        }
        if (currentPhase === 'aviso') {
            return 'Preguntas';
        }
        if (currentPhase === 'deliberacion') {
            return 'Deliberación';
        }
        if (currentPhase === 'limpieza') {
            return 'Limpieza del área';
        }
        return 'Semaforo';
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            {/* Header con botón volver */}
            <div className="p-2 border-b border-gray-800 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Volver</span>
                </Link>

                {/* Botón para cambiar proyecto */}
                {mode !== "custom" && (selectedProject || customData) && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800 border border-blue-500/30 text-sm"
                    >
                        Cambiar Proyecto
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 gap-4">
                {/* Contenido Principal: Información + Semáforo */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Sección Izquierda: Información del Proyecto (1/2) */}
                    <div className="col-span-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 flex flex-col justify-center">
                        {(selectedProject || customData) ? (
                            <div className="space-y-4">
                                {/* Modalidad */}
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1.5 rounded-lg font-semibold text-base ${mode === "protocolo"
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : mode === "informe"
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                        }`}>
                                        {mode === "protocolo" ? "Protocolo" : mode === "informe" ? "Informe" : "Personalizado"}
                                    </span>
                                </div>

                                {/* ID y Título del Proyecto */}
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-white mb-1">{mode === "custom" ? "" : selectedProject?.id}</p>
                                    <h3 className="text-2xl text-gray-400 mb-1">
                                        {mode === "custom" ? customData?.tema : selectedProject?.nombre}
                                    </h3>
                                </div>

                                {/* Participantes */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">Participante Líder</p>
                                        <p className="text-base font-semibold text-white">
                                            {mode === "custom" ? customData?.lider : selectedProject?.lider}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {mode === "custom" ? customData?.noControlLider : selectedProject?.noControlLider}
                                        </p>
                                    </div>
                                    <div className="bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">Participante Compañero</p>
                                        <p className="text-base font-semibold text-white">
                                            {mode === "custom" ? customData?.companero : selectedProject?.companero}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {mode === "custom" ? customData?.noControlCompanero : selectedProject?.noControlCompanero}
                                        </p>
                                    </div>
                                </div>

                                {/* Asesores */}
                                {mode !== "custom" && (
                                    <div className="space-y-2">
                                        <div className="bg-gray-700/30 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">Asesor Interno</p>
                                            <p className="text-sm font-medium text-white">{selectedProject?.asesorInterno?.nombre}</p>
                                        </div>
                                        {selectedProject?.asesorExterno && (
                                            <div className="bg-gray-700/30 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 mb-1">Asesor Externo</p>
                                                <p className="text-sm font-medium text-white">{selectedProject?.asesorExterno?.nombre}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 text-lg">Selecciona un proyecto para comenzar</p>
                            </div>
                        )}
                    </div>

                    {/* Sección Derecha: Semáforo NEÓN (1/2) */}
                    <div className="col-span-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 flex items-center justify-center">
                        <div className={`relative w-96 h-96 rounded-full bg-black border-4 border-gray-700 flex items-center justify-center overflow-hidden transition-all duration-500 
                            ${lightColor === 'green' ? 'shadow-[0_0_60px_rgba(34,197,94,0.8),0_0_100px_rgba(34,197,94,0.5),inset_0_0_30px_rgba(255,255,255,0.3)]' : ''}
                            ${lightColor === 'yellow' ? 'shadow-[0_0_60px_rgba(234,179,8,0.8),0_0_100px_rgba(234,179,8,0.5),inset_0_0_30px_rgba(255,255,255,0.3)]' : ''}
                            ${lightColor === 'red' ? 'shadow-[0_0_80px_rgba(239,68,68,1),0_0_120px_rgba(239,68,68,0.8),0_0_160px_rgba(239,68,68,0.6),inset_0_0_40px_rgba(255,255,255,0.4)] animate-pulse' : ''}
                            ${lightColor === 'cyan' ? 'shadow-[0_0_60px_rgba(34,211,238,0.8),0_0_100px_rgba(34,211,238,0.5),inset_0_0_30px_rgba(255,255,255,0.3)]' : ''}
                            ${lightColor === 'purple' ? 'shadow-[0_0_60px_rgba(168,85,247,0.8),0_0_100px_rgba(168,85,247,0.5),inset_0_0_30px_rgba(255,255,255,0.3)]' : ''}
                            ${lightColor === 'blue' ? 'shadow-[0_0_60px_rgba(59,130,246,0.8),0_0_100px_rgba(59,130,246,0.5),inset_0_0_30px_rgba(255,255,255,0.3)]' : ''}
                        `}>
                            <div className={`w-88 h-88 rounded-full transition-all duration-500 
                                ${lightColor === 'green' ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600' : ''}
                                ${lightColor === 'yellow' ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600' : ''}
                                ${lightColor === 'red' ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 animate-pulse' : ''}
                                ${lightColor === 'cyan' ? 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600' : ''}
                                ${lightColor === 'purple' ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600' : ''}
                                ${lightColor === 'blue' ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' : ''}
                                ${lightColor === 'gray' ? 'bg-gray-800 shadow-inner' : ''}
                            `}></div>
                        </div>
                    </div>
                </div>

                {/* Footer: Timers y Botones de Control */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Timer */}
                        <div className="flex-1 text-center">
                            <p className="text-lg text-gray-400 mb-1">{getPhaseTitle()}</p>
                            <p className="text-6xl font-bold">{formatTime(timeRemaining)}</p>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-2">
                            <button onClick={isRunning ? pauseTimer : startTimer} className={`px-6 py-3 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center gap-2 ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                {isRunning ? 'Pausar' : 'Iniciar'}
                            </button>
                            <button onClick={restartTimer} className="p-4 rounded-lg bg-red-500 hover:bg-red-600 transition-all shadow-lg">
                                <RotateCcw className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensaje de fase actual */}
                {currentPhase !== 'idle' && currentPhase !== 'finished' && (
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">
                            {currentPhase === 'green' && '🟢 Fase Verde - Tiempo Completo'}
                            {currentPhase === 'yellow' && '🟡 Fase Amarilla - Acelera'}
                            {currentPhase === 'red' && '🔴 Fase Roja - Finaliza Ya'}
                            {currentPhase === 'aviso' && '⏱️ Inician las preguntas en 10 segundos...'}
                            {currentPhase === 'deliberacion' && '💭 Deliberación de Jurados'}
                            {currentPhase === 'limpieza' && '🧹 Limpieza del Área'}
                        </p>
                    </div>
                )}

                {currentPhase === 'finished' && (
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-400 animate-pulse">
                            ✅ ¡Presentación Finalizada!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal: Selección de Proyecto (Protocolo/Informe) */}
            {(showModal && mode !== 'custom') && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Selecciona el Proyecto</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {proyectos
                                    .filter(p => p.modalidad.toLowerCase() === mode)
                                    .map((proyecto) => (
                                        <button
                                            key={proyecto.id}
                                            onClick={() => {
                                                setSelectedProject(proyecto);
                                                setShowModal(false);
                                            }}
                                            className="w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-xl p-4 text-left transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-1">
                                                        {proyecto.id} - {proyecto.nombre}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {proyecto.lider} & {proyecto.companero}
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                                                    {proyecto.modalidad}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Configuración Custom */}
            {showCustomModal && mode === "custom" && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Configuración Personalizada</h2>
                            <button
                                onClick={() => setShowCustomModal(false)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Tema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tema de la Presentación</label>
                                <input
                                    type="text"
                                    value={customForm.tema}
                                    onChange={(e) => setCustomForm({ ...customForm, tema: e.target.value })}
                                    placeholder="Ej: Sistema de Gestión Escolar"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                            </div>

                            {/* Participantes */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-yellow-400">Participantes</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm text-gray-400">Líder</h4>
                                        <input
                                            type="text"
                                            value={customForm.lider}
                                            onChange={(e) => setCustomForm({ ...customForm, lider: e.target.value })}
                                            placeholder="Nombre completo"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={customForm.noControlLider}
                                            onChange={(e) => setCustomForm({ ...customForm, noControlLider: e.target.value })}
                                            placeholder="No. Control"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm text-gray-400">Compañero</h4>
                                        <input
                                            type="text"
                                            value={customForm.companero}
                                            onChange={(e) => setCustomForm({ ...customForm, companero: e.target.value })}
                                            placeholder="Nombre completo"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={customForm.noControlCompanero}
                                            onChange={(e) => setCustomForm({ ...customForm, noControlCompanero: e.target.value })}
                                            placeholder="No. Control"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tiempos */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-yellow-400">Configuración de Tiempos (minutos)</h3>
                                <div className="space-y-4">
                                    {/* Semáforo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Semáforo (Presentación)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">🟢 Verde</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={customForm.verde}
                                                    onChange={(e) => setCustomForm({ ...customForm, verde: parseInt(e.target.value) || 0 })}
                                                    placeholder="5"
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">🟡 Amarillo</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={customForm.amarillo}
                                                    onChange={(e) => setCustomForm({ ...customForm, amarillo: parseInt(e.target.value) || 0 })}
                                                    placeholder="2"
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">🔴 Rojo</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={customForm.rojo}
                                                    onChange={(e) => setCustomForm({ ...customForm, rojo: parseInt(e.target.value) || 0 })}
                                                    placeholder="1"
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deliberación */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Deliberación</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customForm.deliberacion}
                                            onChange={(e) => setCustomForm({ ...customForm, deliberacion: parseInt(e.target.value) || 0 })}
                                            placeholder="5"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>

                                    {/* Limpieza */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Limpieza de Área</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customForm.limpieza}
                                            onChange={(e) => setCustomForm({ ...customForm, limpieza: parseInt(e.target.value) || 0 })}
                                            placeholder="3"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del Modal */}
                        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowCustomModal(false)}
                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setCustomData({
                                        tema: customForm.tema || "Tema Personalizado",
                                        lider: customForm.lider || "Participante 1",
                                        noControlLider: customForm.noControlLider || "00000000",
                                        companero: customForm.companero || "Participante 2",
                                        noControlCompanero: customForm.noControlCompanero || "00000000",
                                        semaforo: [customForm.verde, customForm.amarillo, customForm.rojo],
                                        deliberacion: customForm.deliberacion,
                                        limpieza: customForm.limpieza
                                    });
                                    setShowCustomModal(false);
                                }}
                                className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-yellow-500/20"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <footer className="bg-gray-900 text-white py-4">
                <div className="max-w-7xl mx-auto text-center text-gray-400">
                    <p>
                        Desarrollado por{" "}
                        <a
                            href="https://github.com/joeljohs"
                            target="_blank"
                            className="text-purple-400 hover:text-purple-300"
                        >
                            Joel Johs
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Semaforo;
