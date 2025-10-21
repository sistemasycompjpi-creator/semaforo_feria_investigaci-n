import { Link, useNavigate } from "react-router";
import { Clock, FileText, Settings, FolderKanban, GraduationCap } from "lucide-react";
import InstitutionalHeader from "../components/InstitutionalHeader";
import { useSemaforo } from "../contexts/SemaforoContext";

const Dashboard = () => {
    const { setShowCustomModal } = useSemaforo();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header Institucional */}
            <InstitutionalHeader />

            {/* Header */}
            <header className="pt-16 pb-12 px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-3 text-white">
                        Gestor de Presentaciones
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Control de tiempo y gestión de proyectos
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-8 pb-16">
                <div className="max-w-7xl mx-auto space-y-16">
                    {/* Sección: Iniciar Semáforo */}
                    <section>
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-2">Iniciar Semáforo</h2>
                            <p className="text-gray-400 text-sm">Selecciona la modalidad de presentación</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Protocolo Card */}
                            <Link
                                to="/semaforo/protocolo"
                                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/70 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl mb-5 group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20">
                                        <Clock className="h-9 w-9" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3 text-white">
                                        Protocolo
                                    </h3>
                                    <div className="text-gray-300">
                                        <span className="text-xl font-medium text-blue-400">Presentación de Protocolo</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Informe Card */}
                            <Link
                                to="/semaforo/informe"
                                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/70 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mb-5 group-hover:from-green-400 group-hover:to-green-500 transition-all duration-300 shadow-lg shadow-green-500/20">
                                        <FileText className="h-9 w-9" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3 text-white">
                                        Informe
                                    </h3>
                                    <div className="text-gray-300">
                                        <span className="text-xl font-medium text-green-400">Presentación de Informe</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Personalizado Card */}
                            <div
                                onClick={() => {
                                    setShowCustomModal(true);
                                    navigate("/semaforo/custom");
                                }}
                                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/70 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 cursor-pointer"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-2xl mb-5 group-hover:from-yellow-400 group-hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/20">
                                        <Settings className="h-9 w-9" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3 text-white">
                                        Personalizado
                                    </h3>
                                    <div className="text-gray-300">
                                        <span className="text-xl font-medium text-yellow-400">A tu medida</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="border-t border-gray-800"></div>

                    {/* Sección: Gestión de Base de Datos */}
                    <section>
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-2">Gestión de Datos</h2>
                            <p className="text-gray-400 text-sm">Administra proyectos y asesores</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            {/* Proyectos */}
                            <Link
                                to="/proyectos"
                                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/70 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl group-hover:from-purple-400 group-hover:to-purple-500 transition-all duration-300 shadow-lg shadow-purple-500/20">
                                        <FolderKanban className="h-8 w-8" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-1">
                                            Proyectos
                                        </h3>
                                        <p className="text-sm text-gray-400">Gestionar proyectos y participantes</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Asesores */}
                            <Link
                                to="/asesores"
                                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/70 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 rounded-xl group-hover:from-cyan-400 group-hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                                        <GraduationCap className="h-8 w-8" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-1">
                                            Asesores
                                        </h3>
                                        <p className="text-sm text-gray-400">Gestionar asesores internos y externos</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
