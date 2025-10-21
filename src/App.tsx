import { createHashRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Semaforo from "./pages/Semaforo";
import Proyectos from "./pages/Proyectos";
import Asesores from "./pages/Asesores";

const router = createHashRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    // La ruta ahora incluye un parámetro dinámico ':mode'
    path: "/semaforo/:mode",
    element: <Semaforo />,
  },
  {
    path: "/proyectos",
    element: <Proyectos />,
  },
  {
    path: "/asesores",
    element: <Asesores />,
  },
]);

export default router;
