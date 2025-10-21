import { Link } from "react-router";
import { ArrowLeft, Plus, Search, Filter, Edit2, Trash2, X, Download, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import InstitutionalHeader from "../components/InstitutionalHeader";
import { proyectosAPI } from "../backend/api/proyectos";
import { asesoresAPI } from "../backend/api/asesores";
import type { Proyecto, ProyectoConAsesores, NuevoProyecto } from "../backend/schemas";
import { exportProyectosCSV, importProyectosCSV, saveProyectos, readCSVFile } from "../backend/importExport";

const Proyectos = () => {
    const [showModal, setShowModal] = useState(false);
    const [proyectos, setProyectos] = useState<ProyectoConAsesores[]>([]);
    const [asesoresInternos, setAsesoresInternos] = useState(asesoresAPI.getAll('interno'));
    const [asesoresExternos, setAsesoresExternos] = useState(asesoresAPI.getAll('externo'));
    const [filtroModalidad, setFiltroModalidad] = useState<'protocolo' | 'informe' | ''>('');
    const [busqueda, setBusqueda] = useState('');
    const [editando, setEditando] = useState<ProyectoConAsesores | null>(null);
    const [showAsesorForm, setShowAsesorForm] = useState({ interno: false, externo: false });
    const [formData, setFormData] = useState<NuevoProyecto>({
        nombre: '',
        lider: '',
        noControlLider: '',
        companero: '',
        noControlCompanero: '',
        asesorInternoId: 0,
        asesorExternoId: null,
        modalidad: 'protocolo'
    });
    const [nuevoAsesorInterno, setNuevoAsesorInterno] = useState('');
    const [nuevoAsesorExterno, setNuevoAsesorExterno] = useState('');

    useEffect(() => {
        cargarProyectos();
    }, []);

    const cargarProyectos = () => {
        const datos = proyectosAPI.getAll();
        setProyectos(datos);
    };

    const cargarAsesores = () => {
        setAsesoresInternos(asesoresAPI.getAll('interno'));
        setAsesoresExternos(asesoresAPI.getAll('externo'));
    };

    const proyectosFiltrados = proyectos.filter(proyecto => {
        const matchModalidad = filtroModalidad ? proyecto.modalidad === filtroModalidad : true;
        const matchBusqueda = busqueda
            ? proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
              proyecto.lider.toLowerCase().includes(busqueda.toLowerCase()) ||
              proyecto.noControlLider.includes(busqueda)
            : true;
        return matchModalidad && matchBusqueda;
    });

    const handleSubmit = () => {
        try {
            // Crear asesores nuevos si se especificaron
            let asesorInternoId = formData.asesorInternoId;
            let asesorExternoId = formData.asesorExternoId;

            if (showAsesorForm.interno && nuevoAsesorInterno.trim()) {
                const nuevoAsesor = asesoresAPI.create({ nombre: nuevoAsesorInterno, tipo: 'interno' });
                asesorInternoId = nuevoAsesor.id;
                setAsesoresInternos(asesoresAPI.getAll('interno'));
            }

            if (showAsesorForm.externo && nuevoAsesorExterno.trim()) {
                const nuevoAsesor = asesoresAPI.create({ nombre: nuevoAsesorExterno, tipo: 'externo' });
                asesorExternoId = nuevoAsesor.id;
                setAsesoresExternos(asesoresAPI.getAll('externo'));
            }

            const datosProyecto = { ...formData, asesorInternoId, asesorExternoId };

            if (editando) {
                proyectosAPI.update(editando.id, datosProyecto);
            } else {
                proyectosAPI.create(datosProyecto);
            }

            cargarProyectos();
            cerrarModal();
        } catch (error) {
            alert('Error al guardar proyecto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const handleEliminar = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                proyectosAPI.delete(id);
                cargarProyectos();
            } catch (error) {
                alert('Error al eliminar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            }
        }
    };

    const abrirModalEditar = (proyecto: ProyectoConAsesores) => {
        setEditando(proyecto);
        setFormData({
            nombre: proyecto.nombre,
            lider: proyecto.lider,
            noControlLider: proyecto.noControlLider,
            companero: proyecto.companero,
            noControlCompanero: proyecto.noControlCompanero,
            asesorInternoId: proyecto.asesorInternoId,
            asesorExternoId: proyecto.asesorExternoId,
            modalidad: proyecto.modalidad
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditando(null);
        setFormData({
            nombre: '',
            lider: '',
            noControlLider: '',
            companero: '',
            noControlCompanero: '',
            asesorInternoId: 0,
            asesorExternoId: null,
            modalidad: 'protocolo'
        });
        setShowAsesorForm({ interno: false, externo: false });
        setNuevoAsesorInterno('');
        setNuevoAsesorExterno('');
    };

    const handleExportCSV = () => {
        try {
            exportProyectosCSV();
        } catch (error) {
            alert('Error al exportar CSV: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState<{ data: Proyecto[]; errors: string[] } | null>(null);

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const csvContent = await readCSVFile(file);
            const result = importProyectosCSV(csvContent);
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
            saveProyectos(importData.data);
            cargarProyectos();
            cargarAsesores();
            setShowImportModal(false);
            setImportData(null);
            alert('Proyectos importados exitosamente');
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
                            <h1 className="text-4xl font-bold mb-2">Proyectos</h1>
                            <p className="text-gray-400">Gestiona todos los proyectos registrados</p>
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
                            {/* Botón Nuevo Proyecto */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-purple-500/20"
                            >
                                <Plus className="h-5 w-5" />
                                Nuevo Proyecto
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
                                placeholder="Buscar por nombre, líder o número de control..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        {/* Filtro por Modalidad */}
                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 min-w-[200px]">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={filtroModalidad}
                                onChange={(e) => setFiltroModalidad(e.target.value as 'protocolo' | 'informe' | '')}
                                className="bg-transparent text-white outline-none flex-1"
                            >
                                <option value="">Todas las modalidades</option>
                                <option value="protocolo">Protocolo</option>
                                <option value="informe">Informe</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabla de Proyectos */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Proyecto</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Líder</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Compañero</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Asesor Interno</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Asesor Externo</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Modalidad</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {proyectosFiltrados.map((proyecto) => (
                                        <tr key={proyecto.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{proyecto.nombre}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{proyecto.lider}</div>
                                                <div className="text-xs text-gray-400">{proyecto.noControlLider}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{proyecto.companero}</div>
                                                <div className="text-xs text-gray-400">{proyecto.noControlCompanero}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{proyecto.asesorInterno?.nombre || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{proyecto.asesorExterno?.nombre || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${proyecto.modalidad === "protocolo"
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    }`}>
                                                    {proyecto.modalidad.charAt(0).toUpperCase() + proyecto.modalidad.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(proyecto)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminar(proyecto.id)}
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

            {/* Modal para Agregar/Editar Proyecto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{editando ? 'Editar' : 'Nuevo'} Proyecto</h2>
                            <button
                                onClick={cerrarModal}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Información del Proyecto */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-purple-400">Información del Proyecto</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Proyecto</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Sistema de Gestión Escolar"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Modalidad</label>
                                        <select
                                            value={formData.modalidad}
                                            onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as 'protocolo' | 'informe' })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            <option value="">Selecciona una modalidad</option>
                                            <option value="protocolo">Protocolo</option>
                                            <option value="informe">Informe</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Integrantes */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-purple-400">Integrantes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Líder */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-gray-400">Líder del Proyecto</h4>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                placeholder="Juan Pérez"
                                                value={formData.lider}
                                                onChange={(e) => setFormData({ ...formData, lider: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Número de Control</label>
                                            <input
                                                type="text"
                                                placeholder="20401234"
                                                value={formData.noControlLider}
                                                onChange={(e) => setFormData({ ...formData, noControlLider: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    {/* Compañero */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-gray-400">Compañero</h4>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                placeholder="María López"
                                                value={formData.companero}
                                                onChange={(e) => setFormData({ ...formData, companero: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Número de Control</label>
                                            <input
                                                type="text"
                                                placeholder="20401235"
                                                value={formData.noControlCompanero}
                                                onChange={(e) => setFormData({ ...formData, noControlCompanero: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asesor Interno */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-purple-400">Asesor Interno</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Asesor</label>
                                        <select
                                            value={formData.asesorInternoId || ''}
                                            onChange={(e) => setFormData({ ...formData, asesorInternoId: parseInt(e.target.value) })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            <option value="">Selecciona un asesor interno</option>
                                            {asesoresInternos.map(a => (
                                                <option key={a.id} value={a.id}>{a.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="newAsesorInterno"
                                            checked={showAsesorForm.interno}
                                            onChange={(e) => setShowAsesorForm({ ...showAsesorForm, interno: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                                        />
                                        <label htmlFor="newAsesorInterno" className="text-sm text-gray-300 cursor-pointer">
                                            ¿El asesor no se encuentra en la BD? Registrar nuevo asesor
                                        </label>
                                    </div>
                                    {/* Formulario para nuevo asesor interno */}
                                    {showAsesorForm.interno && (
                                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3 animate-in fade-in duration-200">
                                            <p className="text-xs text-gray-400 mb-3">Registro de nuevo asesor interno</p>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-2">Nombre del Asesor</label>
                                                <input
                                                    type="text"
                                                    placeholder="Dr. Juan García"
                                                    value={nuevoAsesorInterno}
                                                    onChange={(e) => setNuevoAsesorInterno(e.target.value)}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Asesor Externo */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-purple-400">Asesor Externo</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Asesor</label>
                                        <select
                                            value={formData.asesorExternoId || ''}
                                            onChange={(e) => setFormData({ ...formData, asesorExternoId: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            <option value="">Selecciona un asesor externo</option>
                                            {asesoresExternos.map(a => (
                                                <option key={a.id} value={a.id}>{a.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="newAsesorExterno"
                                            checked={showAsesorForm.externo}
                                            onChange={(e) => setShowAsesorForm({ ...showAsesorForm, externo: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                                        />
                                        <label htmlFor="newAsesorExterno" className="text-sm text-gray-300 cursor-pointer">
                                            ¿El asesor no se encuentra en la BD? Registrar nuevo asesor
                                        </label>
                                    </div>
                                    {/* Formulario para nuevo asesor externo */}
                                    {showAsesorForm.externo && (
                                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3 animate-in fade-in duration-200">
                                            <p className="text-xs text-gray-400 mb-3">Registro de nuevo asesor externo</p>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-2">Nombre del Asesor</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ing. Carlos Martínez"
                                                    value={nuevoAsesorExterno}
                                                    onChange={(e) => setNuevoAsesorExterno(e.target.value)}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={cerrarModal}
                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-500/20"
                            >
                                {editando ? 'Actualizar' : 'Guardar'} Proyecto
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
                            <p>Se importarán {importData.data.length} proyectos. ¿Desea continuar?</p>
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
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-500/20"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proyectos;
