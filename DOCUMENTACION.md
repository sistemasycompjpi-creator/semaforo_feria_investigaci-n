# Documentación y Manual de Usuario - Sistema de Semáforo de Proyectos

## Introducción

Este documento proporciona una guía completa para el uso y comprensión del Sistema de Semáforo de Proyectos. El sistema está diseñado para facilitar el seguimiento y la gestión de proyectos de residencia, asignando un estado visual (semáforo) a cada uno según su progreso y fechas de entrega.

## Funcionalidades Principales

El sistema cuenta con las siguientes secciones principales:

-   **Dashboard:** Vista principal que muestra un resumen de todos los proyectos y su estado actual.
-   **Proyectos:** Sección para administrar (crear, ver, editar, eliminar) todos los proyectos.
-   **Asesores:** Sección para administrar (crear, ver, editar, eliminar) a los asesores internos y externos.
-   **Semáforo:** Vista detallada del estado de cada proyecto con un sistema de colores intuitivo.

## Código de Colores del Semáforo

El sistema de semáforo utiliza un código de colores para indicar el estado de cada etapa del proyecto. Cada color tiene un significado específico:

-   **Verde:** La etapa se completó a tiempo.
-   **Amarillo:** La etapa está próxima a su fecha de vencimiento.
-   **Rojo:** La etapa ha superado su fecha de vencimiento.
-   **Gris:** La etapa aún no ha comenzado o no tiene una fecha de entrega definida.

## Manual de Usuario

### 1. Dashboard

Al iniciar la aplicación, serás recibido por el Dashboard. Aquí podrás ver:

-   Un resumen de la cantidad de proyectos en cada estado (protocolo, informe).
-   Un acceso rápido a las principales secciones de la aplicación.

### 2. Gestión de Proyectos

Para gestionar los proyectos, navega a la sección **Proyectos** desde el Dashboard.

#### a. Crear un Nuevo Proyecto

1.  Haz clic en el botón **"Nuevo Proyecto"**.
2.  Se abrirá un formulario donde deberás ingresar la siguiente información:
    *   **ID del Proyecto:** Un identificador único para el proyecto (ej. `2025.3-001-BPA`).
    *   **Nombre del Proyecto:** El nombre descriptivo del proyecto.
    *   **Modalidad:** Selecciona si es un `protocolo` o `informe`.
    *   **Líder del Proyecto:** Nombre y número de control del líder.
    *   **Compañero:** Nombre y número de control del compañero (si aplica).
    *   **Asesor Interno:** Selecciona un asesor de la lista o registra uno nuevo.
    *   **Asesor Externo:** Selecciona un asesor de la lista o registra uno nuevo (si aplica).
3.  Haz clic en **"Guardar Proyecto"** para crearlo.

#### b. Editar un Proyecto

1.  En la tabla de proyectos, busca el proyecto que deseas editar.
2.  Haz clic en el ícono de **editar** (lápiz) en la columna de "Acciones".
3.  Se abrirá el mismo formulario de creación, pero con la información del proyecto cargada.
4.  Modifica los campos que necesites y haz clic en **"Actualizar Proyecto"**.

#### c. Eliminar un Proyecto

1.  En la tabla de proyectos, busca el proyecto que deseas eliminar.
2.  Haz clic en el ícono de **eliminar** (bote de basura) en la columna de "Acciones".
3.  Se te pedirá que confirmes la eliminación.

#### d. Importar y Exportar Proyectos

Puedes importar y exportar proyectos en formato CSV para facilitar la carga masiva de datos.

-   **Exportar:** Haz clic en el botón **"Exportar"** para descargar un archivo CSV con todos los proyectos.
-   **Importar:** Haz clic en el botón **"Importar"**, selecciona un archivo CSV con el formato correcto y confirma la importación.

### 3. Gestión de Asesores

La gestión de asesores es similar a la de proyectos. Puedes crear, editar y eliminar asesores desde la sección **Asesores**.

### 4. Vista de Semáforo

La sección **Semáforo** muestra una tabla detallada con el estado de cada proyecto. Aquí podrás ver el progreso de cada etapa y el color correspondiente según el código de colores explicado anteriormente.

## Pie de Página

En la parte inferior de la aplicación, encontrarás un pie de página con el nombre del desarrollador y un enlace a su perfil de GitHub.

---

*Desarrollado por Joel Johs*
