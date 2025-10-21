import { importProyectosCSV } from './importExport';

const csvContent = `ID,Nombre,Líder,No. Control Líder,Compañero,No. Control Compañero,Asesor Interno ID,Asesor Interno,Asesor Externo ID,Asesor Externo,Modalidad
100,Proyecto de prueba,Lider de prueba,12345678,Compañero de prueba,87654321,1,Dr. García,2,Ing. Martínez,protocolo`;

try {
    importProyectosCSV(csvContent);
    console.log('Proyectos importados exitosamente');
} catch (error) {
    console.error('Error al importar CSV:', error);
}
