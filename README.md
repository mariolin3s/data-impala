# DATA IMPALA

Dashboard de monitorización de alertas para eventos de Google Analytics 4.

## Descripción

Esta aplicación permite visualizar y gestionar alertas basadas en el tráfico y eventos de GA4, proporcionando una interfaz moderna para la toma de decisiones basada en datos. Conecta con **Supabase** como backend de datos y presenta la información a través de gráficos, filtros y tablas interactivas.

## Tecnologías

- **Vite** — entorno de desarrollo y construcción
- **React + TypeScript** — interfaz de usuario con tipado estático
- **Tailwind CSS + shadcn/ui** — diseño y componentes
- **Recharts** — visualizaciones de datos
- **Supabase** — base de datos y fetching de alertas
- **date-fns** — manipulación de fechas

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Construir para producción:
   ```bash
   npm run build
   ```

## Características principales

- Monitorización de eventos GA4 por plataforma (Web, iOS, Android)
- Alertas con tres niveles de severidad: Normal, Advertencia, Crítico
- Filtrado por evento, plataforma, estado y texto libre
- Ordenación personalizable con toggle ASC/DESC
- Etiqueta automática "Nuevo" para alertas que no existían el día anterior
- Gráficas de tendencias y distribución histórica de estados
- Rango de fechas seleccionable con integración Supabase optimizada

---

## Changelog

### 2026-02-24

#### Ordenación y búsqueda de alertas
- Añadido buscador de texto libre ("Buscar evento...") para filtrar eventos en tiempo real
- Nuevo menú de ordenación con 4 criterios: **Plataforma + Evento**, **Nombre del evento**, **Severidad** y **Desviación %**
- Toggle ASC/DESC con icono dinámico (↑/↓) junto al selector de orden
- Ordenación por defecto: plataforma ascendente (Android → iOS → Web) + evento A→Z
- La ordenación se aplica dentro de cada grupo de fechas

#### Etiqueta "Nuevo" en alertas
- Las alertas con estado `naranja` o `rojo` que no existían el día anterior muestran automáticamente un badge violeta **✦ Nuevo**
- La comparación se hace por combinación exacta de `evento + plataforma`
- La etiqueta aparece en todas las pestañas (Alertas y Todos los eventos)

#### Filtro por "Nuevo"
- Añadida la opción **✦ Nuevo** en el desplegable de Estado para filtrar exclusivamente alertas nuevas respecto al día anterior

#### Reorganización del layout de filtros
- Filtros (Evento, Plataforma, Estado) alineados a la **izquierda**
- Buscador y controles de ordenación alineados a la **derecha**

---

### 2026-02-17

#### Renombrado de eventos para demo local
- Sustitución de nombres de eventos automáticos de GA4 por nombres de ecommerce y eventos recomendados de GA4 en la interfaz de usuario
- Datos mock actualizados para demostraciones del proyecto

---

### 2026-02-09

#### Optimización del fetching de datos desde Supabase
- Reemplazo del sistema de descarga masiva por chunks de 5.000 filas por una estrategia de consulta paginada y filtrada por rango de fechas
- Reducción significativa del volumen de datos descargados cuando solo se necesita un subconjunto reciente (ej. últimos 7 días)
- Mejora del rendimiento inicial de carga del dashboard

---

### 2026-02-03

#### Corrección del filtro por fecha
- Resuelto error por el que el filtro de rango de fechas no actualizaba correctamente los datos mostrados
- El hook `useAlerts` ahora pasa el rango de fechas como parámetro a Supabase en lugar de filtrar en cliente

---

### 2026-02-02

#### Integración con Firestore
- Backend configurado para usar Firestore como almacenamiento persistente de parámetros de administración
- Migración de datos desde archivo JSON local a Firestore
- Resolución de permisos IAM para la cuenta de servicio

#### Corrección de gráficos
- Los gráficos de tendencias y el filtro de fechas ahora se actualizan correctamente al cambiar el rango seleccionado
- Corregida la desconexión entre la fuente de datos `alerts.json` y los componentes de visualización

---

### 2026-01-30

#### Panel de administración persistente
- Integración de un servidor Node/Bun para gestionar la persistencia de parámetros de administración en un archivo JSON (sin base de datos)
- El formulario de generación de UTMs obtiene sus datos del backend
- Eliminada la lógica redundante de `localStorage` para datos gestionados por el backend
- Todas las operaciones CRUD (guardar, consultar, eliminar) pasan por el nuevo servidor

#### Integración con Firestore en el backend
- Refactorización del servidor Node.js para usar Firestore en lugar de archivo JSON local
- La historia de enlaces UTM continúa gestionándose mediante LocalStorage en el frontend

---

### Inicio del proyecto

#### Funcionalidades base
- Dashboard con resumen de alertas: Total, Normal, Advertencia, Crítico
- Visualización de eventos agrupados por fecha, con estado por colores
- Gráfico de distribución histórica de estados (`StatusHistoryChart`)
- Gráfico de tendencias por evento y plataforma (`TrendChart`)
- Selector de rango de fechas (`DateSelector`)
- Filtros por evento, plataforma y estado (`AlertFilters`)
- Badge de plataforma (Android / iOS / Web) con icono y color distintivo
- Interfaz dark mode con diseño responsive
