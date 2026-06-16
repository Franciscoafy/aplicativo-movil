# CLAUDE.md — Plataforma Móvil de Telemetría para Pozos

## Propósito de este archivo

Este archivo es la fuente de verdad para cualquier agente de IA (Claude u otro LLM) que trabaje en este proyecto.
Antes de escribir cualquier línea de código, leer este archivo completo.
Ante cualquier duda de diseño o implementación, volver aquí primero.

---

## 1. Contexto del Proyecto

### ¿Qué es este sistema?

Una aplicación web **Mobile First y Responsive** que expone telemetría de pozos de agua a usuarios finales (clientes).
Permite visualizar métricas operacionales y analíticas de proyectos y pozos desde teléfonos móviles de **cualquier dimensión de pantalla** (desde ~320px hasta tablets y escritorio).
Se comporta como una PWA pero se despliega inicialmente como aplicación web estándar.

**Responsive no es opcional ni secundario.** No se asume un tamaño de pantalla fijo en ningún momento. Los teléfonos varían enormemente (320px, 360px, 390px, 414px, 428px y más), por lo que ningún layout puede depender de un ancho específico ni de pixeles fijos. Todo se construye con unidades relativas, flexbox/grid fluido, y breakpoints de Tailwind.

### ¿Qué NO es este sistema?

- No es un reemplazo de ThingsBoard ni de Grafana.
- No es un sistema analítico. No calcula nada. Consume analítica ya calculada en PostgreSQL.
- No es un constructor de dashboards. No tiene drag and drop ni widgets configurables en el MVP.
- No accede directamente a PostgreSQL desde el frontend. Jamás.

### ¿Quiénes lo usan?

Clientes que necesitan consultar el estado de sus pozos desde el celular.
No son usuarios técnicos. No quieren tablas. Quieren indicadores y gráficos claros.

### Dominio de negocio

El dominio es **telemetría de pozos de agua** con foco en **cumplimiento normativo DGA**
(Dirección General de Aguas, Chile).

**Importante — corrección sobre el modelo de datos:**
No existen tablas `proyectos` ni `pozos` como entidades propias en la base de datos.
"Proyecto" y "Pozo" no son tablas: son **columnas de filtro** (`numero_de_proyecto`, `pozo`) que existen dentro de cada tabla analítica del schema `analitica`.

Cada tabla analítica representa un tipo de análisis distinto (recuperación, estabilización, caudales, residuos, etc.) y todas comparten el mismo patrón:
- Tienen una columna `pozo` (o equivalente) para filtrar por pozo.
- Tienen una columna `numero_de_proyecto` (o equivalente) para filtrar por proyecto.
- Tienen una columna temporal (mes, fecha, período) para filtrar por rango de fechas.

Entidades conceptuales (no tablas, sino conceptos que existen *a través* de las tablas analíticas):
- **Proyecto**: valor de `numero_de_proyecto` que agrupa pozos.
- **Pozo**: valor de `pozo` (probablemente equivalente o relacionado al CASUB).
- **Análisis / Métrica**: cada tabla del schema `analitica` representa un tipo de análisis con sus propias métricas calculadas.
- **Dashboard**: vista agregada que combina datos de una o varias tablas analíticas para un pozo o proyecto dado.

**Lista de tablas analíticas conocidas (pendiente de confirmar la lista completa):**

| Tabla | Contenido |
|---|---|
| `analitica.analisis_caudales_por_pozo` | Análisis de caudales por pozo |
| `analitica.analisis_de_residuos` | Análisis de residuos |
| `analitica.analisis_recuperacion_por_mes` | Análisis de recuperación mensual |
| `analitica.analisis_estabilizacion_por_mes` | Análisis de estabilización mensual |
| *(otras por confirmar)* | Hay más tablas en el schema `analitica` además de estas 4. Antes de cerrar el contrato final de la API, listar `information_schema.tables` del schema `analitica` y confirmar columnas exactas de filtro en cada una (no asumir que todas usan exactamente `pozo` y `numero_de_proyecto` como nombre de columna; verificar caso por caso). |

Cualquier agente que trabaje en este proyecto debe **verificar el nombre exacto de las columnas de filtro en cada tabla antes de escribir la query**, en lugar de asumir que todas siguen el mismo esquema.

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Rol |
|---|---|
| Next.js (App Router) | Framework React con routing basado en carpetas |
| TypeScript | Tipado estático obligatorio en todo el frontend |
| Tailwind CSS | Estilos utilitarios. Mobile first por defecto |
| shadcn/ui | Componentes base accesibles y personalizables |
| Apache ECharts | Gráficos de series de tiempo, barras, gauge |
| MapLibre GL JS | Mapas de ubicación de proyectos y pozos |

### Backend

| Tecnología | Rol |
|---|---|
| FastAPI | API REST. Única puerta de entrada a PostgreSQL |
| Pydantic v2 | Validación y serialización de modelos |
| asyncpg / SQLAlchemy async | Acceso a base de datos |

### Base de datos

| Tecnología | Rol |
|---|---|
| PostgreSQL | Base de datos principal |
| Schema `normativa_dga` | Tablas de control y cumplimiento regulatorio |
| Schema `analitica` | Tablas analíticas precalculadas que la app consume |

### Autenticación

| Tecnología | Rol |
|---|---|
| Supabase Auth | Manejo de sesiones JWT. Login, tokens, refresh |

### Despliegue

| Tecnología | Rol |
|---|---|
| Docker / Docker Compose | Empaquetado y orquestación de servicios |

---

## 3. Principios de Arquitectura

### Principio 1 — Mobile First y Responsive Real

**No existe un solo "tamaño móvil". Los teléfonos van de 320px a 480px+ de ancho.**

Reglas concretas:

- Nunca usar anchos fijos en píxeles (`width: 375px`). Usar `w-full`, `max-w-*`, `%`, `flex-1`, `grid` fluido.
- Nunca asumir un dispositivo específico. Diseñar y probar contra un rango: 320px (mínimo soportado), 375px, 414px, 768px (tablet), 1024px+ (desktop).
- Las clases de Tailwind siguen el orden: base (móvil pequeño) → `sm:` → `md:` (tablet) → `lg:` (escritorio) → `xl:`. Nunca al revés.
- Textos, paddings y gaps usan escalas relativas de Tailwind (`text-sm`, `p-4`, `gap-2`), no valores arbitrarios calculados para un solo dispositivo.
- Imágenes, mapas y gráficos (ECharts, MapLibre) deben re-renderizar su tamaño cuando el contenedor cambia de ancho (usar `ResizeObserver` o el resize handler nativo de la librería). Nunca fijar `width`/`height` en px duro para estos componentes.
- Probar cada componente nuevo mentalmente (o en devtools) contra al menos 3 anchos: 320px, 390px, 768px.

### Principio 2 — Frontend nunca toca PostgreSQL

El flujo de datos es estricto y unidireccional:

```
Usuario (browser)
       ↓
   Next.js (frontend)
       ↓
   FastAPI (backend)
       ↓
  PostgreSQL (base de datos)
```

Ninguna excepción. Supabase Auth solo maneja identidad, no datos de negocio.

### Principio 3 — La app consume analítica, no la produce

Las tablas del schema `analitica` ya contienen los resultados calculados.
El backend solo lee esas tablas y las expone como JSON.
El frontend solo visualiza ese JSON.
No hay lógica de cálculo en el frontend ni en el backend de esta app.

### Principio 4 — Dashboard primero, tablas nunca

Los usuarios finales ven dashboards con métricas y gráficos.
No existe ninguna pantalla que muestre una tabla de base de datos desnuda.
Cualquier dato tabular debe presentarse como componente visual (métrica card, gráfico, lista formateada).

### Principio 5 — MVP antes que features

El orden de implementación es:

1. Login funcionando
2. Un endpoint analítico funcionando end-to-end con datos reales
3. Filtros funcionando (pozo, numero_de_proyecto, rango de fechas)
4. Gráficos funcionando

**Nada de lo que está fuera del MVP se implementa hasta que estos cuatro puntos estén completos y probados.**

---

## 4. Arquitectura de Carpetas

### Raíz del repositorio

```
proyecto-telemetria-movil/
├── .claude/
│   └── skills/                   # Skills para agentes de IA (Claude Code u otros)
│       ├── SKILL.md              # Índice/orquestación general (si aplica)
│       ├── software-architecture/
│       │   └── SKILL.md
│       ├── api-contracts/
│       │   └── SKILL.md          # Convenciones para crear nuevos endpoints
│       └── responsive-ui/
│           └── SKILL.md          # Reglas de breakpoints y testing visual
│
├── CLAUDE.md                      # Este archivo
├── frontend/
├── backend/
└── docker-compose.yml
```

La carpeta `.claude/skills/` es el espacio designado para que cualquier agente de IA (Claude Code u otro) descubra y use skills específicas de este proyecto. Cada skill vive en su propia subcarpeta con un `SKILL.md` como punto de entrada. Antes de iniciar tareas de arquitectura, creación de endpoints, o diseño de UI responsive, el agente debe revisar si existe una skill aplicable en este directorio.

### Frontend (`/frontend`)

```
frontend/
├── app/                          # Rutas Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout con navegación
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard principal (selección de proyecto/pozo)
│   │   └── analisis/
│   │       ├── caudales/
│   │       │   └── page.tsx
│   │       ├── residuos/
│   │       │   └── page.tsx
│   │       ├── recuperacion/
│   │       │   └── page.tsx
│   │       └── estabilizacion/
│   │           └── page.tsx
│   └── layout.tsx                # Root layout
│
├── components/                   # Componentes visuales reutilizables
│   ├── charts/                   # Gráficos ECharts
│   │   ├── TimeSeriesChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── GaugeChart.tsx
│   │   └── MetricCard.tsx
│   ├── maps/                     # Componentes MapLibre
│   │   ├── ProjectMap.tsx
│   │   ├── WellMap.tsx
│   │   └── MarkerPopup.tsx
│   ├── filters/                  # Controles de filtrado
│   │   ├── ProjectSelector.tsx   # Filtra por numero_de_proyecto
│   │   ├── WellSelector.tsx      # Filtra por pozo
│   │   └── DateRangeSelector.tsx
│   ├── layout/                   # Estructura visual
│   │   ├── Header.tsx
│   │   ├── BottomNavigation.tsx  # Navegación móvil (bottom bar)
│   │   ├── Sidebar.tsx           # Navegación desktop
│   │   └── DashboardContainer.tsx
│   └── ui/                       # shadcn/ui y overrides
│
├── features/                     # Módulos por dominio funcional
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   └── analisis/                 # Un subdirectorio lógico por tabla analítica
│       ├── caudales/
│       ├── residuos/
│       ├── recuperacion/
│       └── estabilizacion/
│
├── services/                     # Llamadas a la API FastAPI (un service por tabla)
│   ├── auth.service.ts
│   ├── caudales.service.ts
│   ├── residuos.service.ts
│   ├── recuperacion.service.ts
│   └── estabilizacion.service.ts
│
├── hooks/                        # Hooks globales reutilizables
│   ├── useCaudales.ts
│   ├── useResiduos.ts
│   ├── useRecuperacion.ts
│   ├── useEstabilizacion.ts
│   └── useFiltros.ts             # Hook compartido: pozo + proyecto + rango fechas
│
├── types/                        # Interfaces TypeScript globales
│   ├── filtros.types.ts          # FiltrosAnalisis (pozo, proyecto, fechas)
│   ├── caudales.types.ts
│   ├── residuos.types.ts
│   ├── recuperacion.types.ts
│   └── estabilizacion.types.ts
│
└── lib/                          # Utilidades, constantes, config
    ├── api.ts                    # Cliente HTTP base (fetch/axios)
    ├── auth.ts                   # Helpers de Supabase Auth
    └── utils.ts
```

### Backend (`/backend`)

```
backend/
├── api/                          # Routers FastAPI — un router por tabla analítica
│   ├── v1/
│   │   ├── auth.py
│   │   ├── caudales.py           # /analisis/caudales
│   │   ├── residuos.py           # /analisis/residuos
│   │   ├── recuperacion.py       # /analisis/recuperacion
│   │   └── estabilizacion.py     # /analisis/estabilizacion
│   └── deps.py                   # Dependencias compartidas (auth, db session, filtros comunes)
│
├── services/                     # Lógica de negocio y transformaciones
│   ├── caudales_service.py
│   ├── residuos_service.py
│   ├── recuperacion_service.py
│   └── estabilizacion_service.py
│
├── repositories/                 # Consultas SQL a PostgreSQL — una por tabla analítica
│   ├── caudales_repository.py
│   ├── residuos_repository.py
│   ├── recuperacion_repository.py
│   └── estabilizacion_repository.py
│
├── schemas/                      # Modelos Pydantic (Request / Response)
│   ├── filtros.py                # FiltrosQuery compartido (pozo, numero_de_proyecto, fechas)
│   ├── caudales.py
│   ├── residuos.py
│   ├── recuperacion.py
│   └── estabilizacion.py
│
├── database/                     # Configuración de conexión
│   ├── connection.py
│   └── session.py
│
└── main.py                       # Punto de entrada FastAPI
```

**Nota de extensibilidad:** cuando se confirme una tabla analítica nueva en el schema `analitica`, se replica el mismo patrón de 4 archivos (router, service, repository, schema) con el nombre de esa tabla. No se crea una estructura distinta por tabla; el patrón es uniforme.

---

## 5. Flujo de Navegación MVP

```
[Login]
   ↓ autenticación OK
[Dashboard Principal]
   ↓ selecciona tipo de análisis (caudales / residuos / recuperación / estabilización)
[Vista de Análisis]
   ↓ aplica filtros: numero_de_proyecto, pozo, rango de fechas
[Resultado filtrado] → métricas + gráfico histórico para esa combinación
```

No hay una jerarquía real "Proyecto → Pozo" como entidades navegables con su propia pantalla de detalle.
Proyecto y pozo son **filtros** que se aplican sobre los datos de cada tabla analítica, no rutas con ID propio.
La UI puede ofrecer selectores de proyecto y pozo (poblados a partir de valores distintos `DISTINCT` de esas columnas), pero no existen endpoints `/projects/{id}` ni `/wells/{id}` porque no hay tabla detrás de esos conceptos.

La navegación móvil se implementa como **Bottom Navigation Bar** (estilo app nativa), con un ítem por tipo de análisis o un menú colapsable si la lista de análisis crece. En desktop se puede mostrar sidebar lateral.

---

## 6. Convenciones de Código

### TypeScript

- Tipado explícito en todos los parámetros y retornos de funciones.
- No usar `any`. Si es necesario un tipo flexible, usar `unknown` y hacer narrowing.
- Interfaces con nombre en PascalCase en `/types`.
- Tipos de respuesta de la API siempre definidos en `/types`.

```typescript
// ✅ Correcto
interface Well {
  id: string
  name: string
  projectId: string
  coordinates: [number, number] | null
}

async function fetchWell(id: string): Promise<Well> { ... }

// ❌ Incorrecto
async function fetchWell(id: any): Promise<any> { ... }
```

### Componentes React

- Functional components con arrow functions.
- Props siempre tipadas con interface.
- Un componente por archivo. El archivo lleva el nombre del componente.
- Componentes de UI pura en `/components`. Lógica de negocio en `/features`.

```typescript
// ✅ Correcto
interface MetricCardProps {
  label: string
  value: number
  unit: string
  trend?: 'up' | 'down' | 'stable'
}

const MetricCard = ({ label, value, unit, trend }: MetricCardProps) => {
  return (...)
}

export default MetricCard
```

### Tailwind CSS

- Mobile first siempre: clases base para móvil, luego `md:` y `lg:`.
- No escribir CSS personalizado salvo que sea absolutamente imposible con Tailwind.
- Componentes de shadcn/ui se personalizan vía variantes, no sobreescribiendo clases directamente.

```tsx
// ✅ Correcto — mobile first
<div className="flex flex-col gap-2 p-4 md:flex-row md:gap-4 lg:p-6">

// ❌ Incorrecto — desktop first
<div className="flex flex-row gap-4 p-6 sm:flex-col sm:gap-2 sm:p-4">
```

### Servicios (comunicación con API)

- Todos los calls a la API de FastAPI pasan por `/services`.
- El cliente HTTP base está en `lib/api.ts`.
- Manejar siempre los estados: loading, error, data.
- Los hooks en `/hooks` consumen los servicios y exponen el estado al componente.

```typescript
// services/well.service.ts
export async function getWellById(id: string): Promise<Well> {
  const res = await apiClient.get(`/wells/${id}`)
  return res.data
}

// hooks/useWell.ts
export function useWell(id: string) {
  const [well, setWell] = useState<Well | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ...
  return { well, loading, error }
}
```

### Python / FastAPI

- PEP 8 estricto.
- Type hints en todas las funciones.
- Los routers solo manejan HTTP (request/response). La lógica va en services.
- Los services no hacen SQL. El SQL va en repositories.
- Los repositories retornan modelos Pydantic o dicts. Nunca ORM objects raw hacia arriba.

---

## 7. Endpoints de la API (MVP)

Todos los endpoints están bajo el prefijo `/api/v1`.

### Principio del diseño de la API

**No existen endpoints `/projects` ni `/wells` como recursos propios.**
Cada tabla del schema `analitica` tiene su propio endpoint de lectura, y todos aceptan los mismos filtros base: `pozo`, `numero_de_proyecto` y rango de fechas. El backend nunca infiere ni inventa relaciones entre tablas: cada endpoint consulta únicamente su tabla correspondiente.

### Autenticación

```
POST /auth/login          → Iniciar sesión
POST /auth/logout         → Cerrar sesión
GET  /auth/me             → Perfil del usuario autenticado
```

### Filtros (recurso de soporte, no una tabla de negocio)

Para poblar los selectores de la UI (`ProjectSelector`, `WellSelector`) sin tener tablas dedicadas, se exponen endpoints de valores distintos por tabla:

```
GET  /analisis/{tabla}/proyectos   → Lista de valores distintos de numero_de_proyecto en esa tabla
GET  /analisis/{tabla}/pozos       → Lista de valores distintos de pozo en esa tabla (opcionalmente filtrado por ?numero_de_proyecto=)
```

Donde `{tabla}` es uno de: `caudales`, `residuos`, `recuperacion`, `estabilizacion` (y las que se confirmen a futuro).

### Análisis — un endpoint por tabla analítica

```
GET  /analisis/caudales         → Datos de analitica.analisis_caudales_por_pozo
GET  /analisis/residuos         → Datos de analitica.analisis_de_residuos
GET  /analisis/recuperacion     → Datos de analitica.analisis_recuperacion_por_mes
GET  /analisis/estabilizacion   → Datos de analitica.analisis_estabilizacion_por_mes
```

Todos estos endpoints aceptan los mismos query params de filtro:

```
?pozo=<valor>
&numero_de_proyecto=<valor>
&from=2024-01-01
&to=2024-12-31
```

- `pozo` y `numero_de_proyecto` son opcionales; si no se envían, se devuelve el set completo (paginado).
- `from`/`to` filtran sobre la columna temporal de cada tabla (el nombre exacto de esa columna —`mes`, `fecha`, `periodo`, etc.— debe confirmarse por tabla; no asumir que es igual en todas).
- La paginación (`limit`/`offset` o cursor) se define al implementar el primer endpoint real y se replica igual en los demás.

**Patrón de implementación por tabla (repetir para cada una):**

1. `repositories/<tabla>_repository.py` — construye el `SELECT` con `WHERE` dinámico según los filtros presentes, usando `TRIM()` sobre columnas de texto si aplica (ver sección 14).
2. `services/<tabla>_service.py` — recibe los filtros validados, llama al repository, aplica transformaciones livianas si son necesarias (ninguna lógica de cálculo nueva).
3. `schemas/<tabla>.py` — define el modelo Pydantic de respuesta específico de esa tabla.
4. `api/v1/<tabla>.py` — router que expone `GET /analisis/<tabla>` y delega al service.

### Cómo agregar una tabla analítica nueva

Cuando se confirme una tabla adicional en el schema `analitica`:

1. Verificar en PostgreSQL el nombre exacto de sus columnas de filtro (`pozo`, `numero_de_proyecto`, columna temporal) — no asumir que coinciden con las demás tablas.
2. Crear los 4 archivos del patrón (repository, service, schema, router) siguiendo el mismo nombre de tabla.
3. Agregar el nuevo endpoint a esta sección del `CLAUDE.md`.
4. Agregar el service y hook correspondiente en el frontend (`services/<tabla>.service.ts`, `hooks/use<Tabla>.ts`).

---

## 8. Modelos de Datos Clave

### Filtros compartidos (frontend)

```typescript
interface FiltrosAnalisis {
  pozo?: string
  numeroDeProyecto?: string
  from?: string                     // ISO 8601 date
  to?: string                       // ISO 8601 date
}
```

### Ejemplo de tipo de respuesta por tabla (caudales)

Cada tabla analítica tiene su propio tipo, ya que sus columnas de negocio son distintas entre sí. Este es un ejemplo ilustrativo para `analisis_caudales_por_pozo`; los campos exactos se confirman al revisar la tabla real.

```typescript
interface CaudalAnalisis {
  pozo: string
  numeroDeProyecto: string
  periodo: string                   // nombre de columna temporal a confirmar
  caudal: number
  unidad: string
  porcentajeCumplimiento: number | null
}

interface TimeSeriesPoint {
  timestamp: string                 // ISO 8601
  value: number
}
```

### Filtros compartidos (backend, Pydantic)

```python
class FiltrosQuery(BaseModel):
    pozo: str | None = None
    numero_de_proyecto: str | None = None
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
```

### Ejemplo de schema de respuesta por tabla (caudales)

```python
class CaudalAnalisisResponse(BaseModel):
    pozo: str
    numero_de_proyecto: str
    periodo: str
    caudal: float
    unidad: str
    porcentaje_cumplimiento: float | None
```

Cada tabla analítica (`residuos`, `recuperacion`, `estabilizacion`, y las que se confirmen) tiene su propio `*Response` siguiendo este mismo patrón, con los campos reales de su tabla.

---

## 9. Autenticación y Sesiones

- Supabase Auth provee tokens JWT.
- El frontend guarda el token en memoria (no localStorage).
- Cada request al backend incluye el header `Authorization: Bearer <token>`.
- El backend valida el token contra Supabase en cada request protegido.
- La dependencia `get_current_user` en `api/deps.py` centraliza esta validación.
- Las rutas no protegidas son solo `/auth/login`.

---

## 10. Qué NO implementar en el MVP

Las siguientes funcionalidades están **explícitamente fuera del alcance** del MVP.
No crear código para ellas. No crear carpetas preparatorias para ellas.
Si se solicita implementar alguna durante el MVP, rechazar y redirigir al MVP.

| Feature | Estado |
|---|---|
| Drag and drop de widgets | ❌ Fuera del MVP |
| Constructor visual de dashboards | ❌ Fuera del MVP |
| Layouts configurables por usuario | ❌ Fuera del MVP |
| IA para generación de dashboards | ❌ Fuera del MVP |
| Consultas en lenguaje natural | ❌ Fuera del MVP |
| Multi-base de datos | ❌ Fuera del MVP |
| Exportación avanzada | ❌ Fuera del MVP |
| Edición de alertas desde la app | ❌ Fuera del MVP |
| Configuración avanzada de usuario | ❌ Fuera del MVP |

---

## 11. Orden de Implementación

Seguir este orden estrictamente. No avanzar al siguiente paso hasta que el anterior esté funcionando con datos reales (no mocks).

```
Paso 1: Login
  - Formulario de login
  - Integración con Supabase Auth
  - Redirección post-login
  - Protección de rutas autenticadas

Paso 2: Primer endpoint analítico end-to-end (elegir una tabla, ej. caudales)
  - Confirmar columnas reales de analitica.analisis_caudales_por_pozo
  - Repository + service + schema + router para GET /analisis/caudales
  - Visualización de MetricCards en el frontend con datos reales (no mocks)

Paso 3: Filtros funcionando sobre esa tabla
  - ProjectSelector y WellSelector poblados vía /analisis/caudales/proyectos y /pozos
  - DateRangeSelector propagando from/to al endpoint
  - Confirmar que el patrón de filtros funciona antes de replicarlo

Paso 4: Replicar el patrón al resto de tablas analíticas
  - residuos, recuperacion, estabilizacion (y las que se confirmen)
  - Mismo patrón de 4 archivos en backend, mismo service/hook en frontend

Paso 5: Gráficos funcionando
  - TimeSeriesChart consumiendo los endpoints de análisis con rango de fechas
  - Integración ECharts responsive (resize dinámico, sin tamaños fijos en px)
  - Verificación visual en al menos 320px, 390px y 768px
```

---

## 12. Checklist antes de cada PR

Antes de abrir un Pull Request, verificar:

- [ ] El componente es responsive y se ve correcto en al menos 320px, 390px y 768px (no solo un tamaño)
- [ ] No hay anchos/alturas fijos en px para layouts ni para gráficos/mapas
- [ ] No hay `any` en TypeScript
- [ ] Los types nuevos están definidos en `/types`
- [ ] Los calls a la API pasan por `/services`, no directamente desde el componente
- [ ] El backend no hace SQL en el router ni en el service
- [ ] Si se agregó una tabla analítica nueva, se confirmaron sus columnas reales antes de escribir la query
- [ ] Los nuevos endpoints están documentados en este archivo (sección 7)
- [ ] No se implementó nada de la lista "Fuera del MVP"
- [ ] Si se usó una skill de `.claude/skills/`, se siguió su guía sin saltarse pasos

---

## 13. Glosario del Dominio

| Término | Significado |
|---|---|
| DGA | Dirección General de Aguas. Organismo regulador del agua en Chile |
| CASUB | Código DGA que identifica un pozo de forma única |
| Caudal | Flujo de agua extraída por el pozo (m³/h o L/s) |
| BC | Bomba Corriendo. Indicador binario de si la bomba está activa |
| QC | Caudal Corriendo. Indicador de flujo activo |
| Nivel | Profundidad del nivel freático en el pozo |
| Drawdown | Descenso del nivel de agua durante el bombeo |
| MOP | Modalidad Operacional del Pozo |
| Normativa DGA | Régimen de cumplimiento regulatorio de extracción de agua |
| Telemetría | Datos de sensores enviados en tiempo real desde los pozos |

---

## 14. Notas Adicionales

- Las tablas analíticas pueden tener espacios trailing en la columna `pozo` (heredado del CASUB original). Normalizar siempre con `TRIM()` al filtrar o comparar por `pozo` en las queries.
- Las fechas en PostgreSQL están en UTC. Chile opera en UTC-3 (verano) / UTC-4 (invierno). Convertir siempre con `AT TIME ZONE 'America/Santiago'` antes de mostrar al usuario.
- No asumir que todos los valores de `pozo` tienen coordenadas geográficas asociadas. El campo puede ser nulo o requerir un mapeo aparte (tabla/archivo de coordenadas por pozo) si no vive dentro de las tablas analíticas.
- El mapa en la pantalla principal es opcional para el MVP, pero si se implementa, las coordenadas deben obtenerse de su fuente real (posiblemente una tabla de mapeo separada, no las tablas analíticas) — confirmar de dónde provienen antes de construir `ProjectMap`/`WellMap`.
