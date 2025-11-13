import { Link } from "react-router";
import { ArrowLeft, Plus, Search, Filter, Edit2, Trash2, X, Download, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import InstitutionalHeader from "../components/InstitutionalHeader";
import { asesoresAPI } from "../backend/api/asesores";
import type { Asesor } from "../backend/schemas";
import { exportAsesoresCSV, importAsesoresCSV, saveAsesores, readCSVFile, downloadCSV } from "../backend/importExport";

const Asesores = () => {
    const [showModal, setShowModal] = useState(false);
    const [asesores, setAsesores] = useState<Asesor[]>([]);
    const [filtroTipo, setFiltroTipo] = useState<'interno' | 'externo' | ''>('');
    const [busqueda, setBusqueda] = useState('');
    const [editando, setEditando] = useState<Asesor | null>(null);
    const [formData, setFormData] = useState({ nombre: '', tipo: 'interno' as 'interno' | 'externo' });
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState<{ data: Asesor[]; errors: string[] } | null>(null);

    // Cargar asesores al montar el componente
    useEffect(() => {
        cargarAsesores();
    }, []);

    const cargarAsesores = () => {
        const datos = asesoresAPI.getAll();
        setAsesores(datos);
    };

    const asesoresFiltrados = asesores.filter(asesor => {
        const matchTipo = filtroTipo ? asesor.tipo === filtroTipo : true;
        const matchBusqueda = busqueda
            ? asesor.nombre.toLowerCase().includes(busqueda.toLowerCase())
            : true;
        return matchTipo && matchBusqueda;
    });

    const handleSubmit = () => {
        try {
            if (editando) {
                // Actualizar asesor existente
                asesoresAPI.update(editando.id, formData);
            } else {
                // Crear nuevo asesor
                asesoresAPI.create(formData);
            }
            cargarAsesores();
            cerrarModal();
        } catch (error) {
            alert('Error al guardar asesor: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const handleEliminar = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este asesor?')) {
            try {
                asesoresAPI.delete(id);
                cargarAsesores();
            } catch (error) {
                alert('Error al eliminar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            }
        }
    };

    const abrirModalEditar = (asesor: Asesor) => {
        setEditando(asesor);
        setFormData({ nombre: asesor.nombre, tipo: asesor.tipo });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditando(null);
        setFormData({ nombre: '', tipo: 'interno' });
    };

    const handleExportCSV = () => {
        try {
            const csv = exportAsesoresCSV();
            downloadCSV('asesores.csv', csv);
        } catch (error) {
            alert('Error al exportar CSV: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const csvContent = await readCSVFile(file);
            const result = importAsesoresCSV(csvContent);
            setImportData(result);
            setShowImportModal(true);
        } catch (error) {
            alert('Error al importar CSV: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }

        // Resetear el input para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';
    };

    const confirmImport = () => {
        if (importData && importData.data.length > 0) {
            saveAsesores(importData.data);
            cargarAsesores();
            setShowImportModal(false);
            setImportData(null);
            alert('Asesores importados exitosamente');
        } else {
            setShowImportModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header Institucional */}
            <InstitutionalHeader />

            {/* Header */}
            <header className="pt-8 pb-6 px-8 border-b border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Volver al Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Asesores</h1>
                            <p className="text-gray-400">Gestiona asesores internos y externos</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Botón Exportar CSV */}
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/20"
                                title="Exportar a CSV"
                            >
                                <Download className="h-5 w-5" />
                                Exportar
                            </button>
                            {/* Botón Importar CSV */}
                            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
                                <Upload className="h-5 w-5" />
                                Importar
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleImportCSV}
                                    className="hidden"
                                />
                            </label>
                            {/* Botón Nuevo Asesor */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                <Plus className="h-5 w-5" />
                                Nuevo Asesor
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Filtros y Búsqueda */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                        {/* Filtro por Tipo */}
                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 min-w-[200px]">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value as 'interno' | 'externo' | '')}
                                className="bg-transparent text-white outline-none flex-1"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="interno">Interno</option>
                                <option value="externo">Externo</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabla de Asesores */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nombre del Asesor</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tipo</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {asesoresFiltrados.map((asesor) => (
                                        <tr key={asesor.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-400">{asesor.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{asesor.nombre}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${asesor.tipo === "interno"
                                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                    }`}>
                                                    {asesor.tipo.charAt(0).toUpperCase() + asesor.tipo.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(asesor)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminar(asesor.id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            
                        {/* Modal para Agregar/Editar Asesor */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl">
                                    {/* Modal Header */}
                                    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                        <h2 className="text-2xl font-bold">{editando ? 'Editar' : 'Nuevo'} Asesor</h2>
                                        <button
                                            onClick={cerrarModal}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
            
                                    {/* Modal Body */}
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Asesor</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Dr. Juan García"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Asesor</label>
                                            <select
                                                value={formData.tipo}
                                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'interno' | 'externo' })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            >
                                                <option value="">Selecciona el tipo</option>
                                                <option value="interno">Interno</option>
                                                <option value="externo">Externo</option>
                                            </select>
                                        </div>
                                    </div>
            
                                    {/* Modal Footer */}
                                    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                                        <button
                                            onClick={cerrarModal}
                                            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20"
                                        >
                                            {editando ? 'Actualizar' : 'Guardar'} Asesor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
            
                        {/* Modal de Confirmación de Importación */}
                        {showImportModal && importData && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl">
                                    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                        <h2 className="text-2xl font-bold">Confirmar Importación</h2>
                                        <button
                                            onClick={() => setShowImportModal(false)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <p>Se importarán {importData.data.length} asesores. ¿Desea continuar?</p>
                                        {importData.errors.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-red-400">Se encontraron los siguientes errores:</p>
                                                <ul className="list-disc list-inside text-red-400">
                                                    {importData.errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                                        <button
                                            onClick={() => setShowImportModal(false)}
                                            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmImport}
                                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20"
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
            
            export default Asesores;
            