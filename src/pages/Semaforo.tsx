import { useParams, Link } from "react-router";
import { ArrowLeft, Play, Pause, RotateCcw, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { proyectosAPI } from "../backend/api/proyectos";
import type { ProyectoConAsesores } from "../backend/schemas";
import { useSemaforo } from "../contexts/useSemaforo";

type TimerPhase = 'idle' | 'green' | 'yellow' | 'red' | 'preguntasRespuestas' | 'cambioEquipo' | 'finished' | 'aviso';
type LightColor = 'green' | 'yellow' | 'red' | 'cyan' | 'purple' | 'blue' | 'gray';

const circleColorClasses: Record<LightColor, string> = {
    green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_90px_rgba(34,197,94,0.7)]',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-[0_0_90px_rgba(234,179,8,0.7)]',
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_100px_rgba(239,68,68,0.85)]',
    cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-[0_0_80px_rgba(34,211,238,0.7)]',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-[0_0_80px_rgba(168,85,247,0.7)]',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_80px_rgba(59,130,246,0.7)]',
    gray: 'bg-gray-700 shadow-[0_0_80px_rgba(15,23,42,0.9)]',
};

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
        preguntasRespuestas: number;
        cambioEquipo: number;
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
        preguntasRespuestas: 5,
        cambioEquipo: 3
    });

    // Configuración de tiempos según modalidad
    const tiemposConfig = {
        protocolo: { semaforo: [7, 2, 1], preguntasRespuestas: 6, cambioEquipo: 4 },
        informe: { semaforo: [7, 2, 1], preguntasRespuestas: 6, cambioEquipo: 4 },
    };

    const getTiempos = () => {
        if (mode === "custom" && customData) {
            return customData;
        }
        return tiemposConfig[mode as keyof typeof tiemposConfig] || tiemposConfig.protocolo;
    };

    const tiempos = getTiempos();

    const getPhaseBadgeLabel = () => {
        switch (currentPhase) {
            case 'green':
                return 'Fase verde';
            case 'yellow':
                return 'Fase amarilla';
            case 'red':
                return 'Fase roja';
            case 'aviso':
                return 'Aviso';
            case 'preguntasRespuestas':
                return 'Preguntas';
            case 'cambioEquipo':
                return 'Cambio de equipo';
            case 'finished':
                return 'Presentación finalizada';
            default:
                return 'Listo';
        }
    };

    const getPhaseTitle = () => {
        switch (currentPhase) {
            case 'green':
                return '🟢 Presentación - fase verde';
            case 'yellow':
                return '🟡 Presentación - fase amarilla';
            case 'red':
                return '🔴 Presentación - fase roja';
            case 'aviso':
                return '⏱️ Aviso de preguntas';
            case 'preguntasRespuestas':
                return '💭 Preguntas y respuestas';
            case 'cambioEquipo':
                return '🧹 Cambio de equipo expositor';
            case 'finished':
                return '✅ Presentación finalizada';
            default:
                return '⏱️ Listo';
        }
    };

    const phaseBadgeLabel = getPhaseBadgeLabel();
    const phaseTitle = getPhaseTitle();

    const lightColor: LightColor =
        currentPhase === 'green' ? 'green'
            : currentPhase === 'yellow' ? 'yellow'
                : currentPhase === 'red' ? 'red'
                    : currentPhase === 'aviso' ? 'cyan'
                        : currentPhase === 'preguntasRespuestas' ? 'purple'
                            : currentPhase === 'cambioEquipo' ? 'blue'
                                : currentPhase === 'finished' ? 'gray'
                                    : 'gray';

    const circleColorClass = circleColorClasses[lightColor];

    const playSound = (type: 'change' | 'finish') => {
        try {
            const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            const context = new AudioContextClass();

            // Main Oscillator (más agudo)
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.frequency.value = type === 'finish' ? 900 : 600;
            oscillator.type = 'triangle';

            // Sub Oscillator (más grave, para dar cuerpo)
            const subOscillator = context.createOscillator();
            const subGainNode = context.createGain();
            subOscillator.connect(subGainNode);
            subGainNode.connect(context.destination);
            subOscillator.frequency.value = type === 'finish' ? 450 : 300;
            subOscillator.type = 'sine';

            const now = context.currentTime;

            if (type === 'finish') {
                // Sonido de finalización (más largo y melódico)
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

                subGainNode.gain.setValueAtTime(0, now);
                subGainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
                subGainNode.gain.linearRampToValueAtTime(0, now + 0.5);

                oscillator.start(now);
                subOscillator.start(now);
                oscillator.stop(now + 0.5);
                subOscillator.stop(now + 0.5);
            } else {
                // Sonido de cambio (corto y nítido)
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                subGainNode.gain.setValueAtTime(0.4, now);
                subGainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                oscillator.start(now);
                subOscillator.start(now);
                oscillator.stop(now + 0.2);
                subOscillator.stop(now + 0.2);
            }
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

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Tiempo terminado, cambiar de fase
                        playSound('finish');

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
                            setCurrentPhase('preguntasRespuestas');
                            return (tiempos.preguntasRespuestas) * 60;
                        } else if (currentPhase === 'preguntasRespuestas') {
                            setCurrentPhase('cambioEquipo');
                            const newCambioEquipoTime = (tiempos.cambioEquipo * 60) - 10;
                            return newCambioEquipoTime > 0 ? newCambioEquipoTime : 0;
                        } else if (currentPhase === 'cambioEquipo') {
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
                playSound('change');
            } else if (currentPhase === 'yellow') {
                setCurrentPhase('red');
                setTimeRemaining((tiempos.semaforo[2]) * 60);
                playSound('change');
            } else if (currentPhase === 'red') {
                setCurrentPhase('aviso');
                setTimeRemaining(10);
                playSound('change');
            } else if (currentPhase === 'aviso') {
                setCurrentPhase('preguntasRespuestas');
                setTimeRemaining((tiempos.preguntasRespuestas) * 60);
                playSound('change');
            } else if (currentPhase === 'preguntasRespuestas') {
                setCurrentPhase('cambioEquipo');
                const newCambioEquipoTime = (tiempos.cambioEquipo * 60) - 10;
                setTimeRemaining(newCambioEquipoTime > 0 ? newCambioEquipoTime : 0);
                playSound('change');
            } else if (currentPhase === 'cambioEquipo') {
                setCurrentPhase('finished');
                setIsRunning(false);
                playSound('finish');
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeRemaining, currentPhase, tiempos]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <header className="p-3 border-b border-gray-800 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-base">Volver</span>
                </Link>
                {mode !== "custom" && (selectedProject || customData) && (
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg hover:bg-gray-800 border border-blue-500/30 text-base">
                        Cambiar Proyecto
                    </button>
                )}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-6">
                {(selectedProject || customData) ? (
                    <div className="w-full space-y-5">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs uppercase tracking-[0.5em] text-cyan-300">Proyecto activo</span>
                            <h1 className="text-4xl sm:text-5xl font-black text-white text-center">
                                {mode === "custom"
                                    ? "Personalizado"
                                    : `${selectedProject?.id ?? "BPA-000"} - ${selectedProject?.nombre ?? "Proyecto"}`}
                            </h1>
                            <p className="text-sm text-gray-400 uppercase tracking-[0.4em]">
                                {mode === "custom" ? customData?.tema?.toUpperCase() ?? "TEMA PERSONALIZADO" : ""}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg shadow-cyan-900/40">
                                <p className="text-xs uppercase tracking-wide text-cyan-200">Líder</p>
                                <p className="text-2xl font-semibold text-white mt-2">{mode === "custom" ? customData?.lider || "Participante 1" : selectedProject?.lider}</p>
                                <p className="text-sm text-cyan-100 mt-1">{mode === "custom" ? customData?.noControlLider || "00000000" : selectedProject?.noControlLider}</p>
                            </div>
                            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg shadow-purple-900/40">
                                <p className="text-xs uppercase tracking-wide text-purple-200">Compañero</p>
                                <p className="text-2xl font-semibold text-white mt-2">{mode === "custom" ? customData?.companero || "Participante 2" : selectedProject?.companero}</p>
                                <p className="text-sm text-purple-100 mt-1">{mode === "custom" ? customData?.noControlCompanero || "00000000" : selectedProject?.noControlCompanero}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <p className="text-gray-400">Selecciona un proyecto para iniciar el cronómetro y mostrar los datos.</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className={`w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-white/10 transition-all duration-500 ${circleColorClass}`}></div>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold tracking-[0.5em] uppercase text-white bg-black/60 border border-white/30">
                            {phaseBadgeLabel}
                        </div>
                    </div>
                    <div className="w-full max-w-xs">
                        <div className="bg-black/70 border border-white/20 rounded-2xl px-8 py-6 shadow-2xl shadow-black/60">
                            <p className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white">
                                {formatTime(timeRemaining)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                    <button onClick={isRunning ? pauseTimer : startTimer} className={`px-10 py-4 rounded-full font-bold text-2xl transition-all shadow-lg flex items-center gap-3
                        ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
                        ${!selectedProject && !customData ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                        disabled={!selectedProject && !customData}
                    >
                        {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        {isRunning ? 'Pausar' : 'Iniciar'}
                    </button>
                    <button onClick={restartTimer} className="p-5 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-lg">
                        <RotateCcw className="h-8 w-8" />
                    </button>
                </div>

                {currentPhase !== 'idle' && currentPhase !== 'finished' && (
                    <div className="text-center mt-4">
                        <p className="text-xl font-bold text-white">
                            {phaseTitle}
                            {currentPhase === 'green' && ` (${tiempos.semaforo[0]} min)`}
                            {currentPhase === 'yellow' && ` (${tiempos.semaforo[1]} min)`}
                            {currentPhase === 'red' && ` (${tiempos.semaforo[2]} min)`}
                        </p>
                    </div>
                )}
            </main>

            {/* Modals */}
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

                                    {/* Preguntas y Respuestas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Preguntas y Respuestas</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customForm.preguntasRespuestas}
                                            onChange={(e) => setCustomForm({ ...customForm, preguntasRespuestas: parseInt(e.target.value) || 0 })}
                                            placeholder="5"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>

                                    {/* Cambio de Equipo Expositor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Cambio de Equipo Expositor</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customForm.cambioEquipo}
                                            onChange={(e) => setCustomForm({ ...customForm, cambioEquipo: parseInt(e.target.value) || 0 })}
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
                                        preguntasRespuestas: customForm.preguntasRespuestas,
                                        cambioEquipo: customForm.cambioEquipo
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

};

export default Semaforo;
