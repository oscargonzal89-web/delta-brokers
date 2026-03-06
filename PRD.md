# PRD — Plataforma Externa Delta Brokers para Gestión de Créditos Hipotecarios (Fase 1)

## 0. Metadatos
- **Producto:** Delta Brokers Credit Ops
- **Versión PRD:** v1.0
- **Fecha:** 2026-03-03
- **Owner:** Product (Delta Brokers)
- **Usuarios objetivo:** Analistas Delta Brokers, Coordinador, Administrador
- **País:** Colombia
- **Alcance fase 1:** Crédito hipotecario + Leasing financiero (seguimiento operativo, no originación bancaria)

---

## 1. Título
Plataforma multi-proyecto para seguimiento de preaprobación, aprobación, legalización y desembolso de créditos hipotecarios/leasing con importación Excel y alertas de vencimiento.

---

## 2. Resumen ejecutivo
Delta Brokers requiere una plataforma externa para administrar el seguimiento de clientes de proyectos de vivienda nueva que necesitan financiación (crédito/leasing). Actualmente los bancos entregan bases en Excel y el control operativo se vuelve difícil: hay poca trazabilidad por cliente, riesgo de vencimientos de cartas de aprobación, dispersión de información y baja visibilidad de avance por proyecto.

El producto propuesto centraliza la operación por proyecto/sala de ventas, permite cargar bases Excel estandarizadas, gestionar el funnel por etapas macro (Preaprobación → Aprobación → Legalización → Desembolsado), controlar subestados por etapa, asignar responsables (3 tipos de analista), adjuntar documentos (cartas), y generar alertas automáticas de vencimiento (<60 días) basadas en vigencia en días.

---

## 3. Situación actual (problema)
### 3.1 Dolor operativo
- Bases de clientes en Excel con variaciones por proyecto/banco.
- No existe trazabilidad uniforme por cliente (estado real, responsable, documentos).
- Riesgo alto de vencimiento de aprobaciones por falta de control del “tiempo restante”.
- Reportería manual: conteos por etapa/subestado y priorización requieren trabajo recurrente.

### 3.2 Impacto
- Pérdidas de eficiencia (doble digitación, actualizaciones manuales).
- Incremento de errores (duplicados, versiones de Excel, campos inconsistentes).
- Clientes “se caen” por vencimientos o falta de seguimiento oportuno.

---

## 4. Objetivos y no objetivos
### 4.1 Objetivos (fase 1)
1. **Gestión multi-proyecto**: crear proyectos con ciudad, nombre y banco financiador principal (1).
2. **Importación Excel**: cargar bases recurrentes por proyecto, con deduplicación y reporte de errores por fila.
3. **Seguimiento por cliente**: ficha 360 (cliente/inmueble/financiero), documentos, asignaciones y historial.
4. **Funnel por etapas macro**: Preaprobación → Aprobación → Legalización → Desembolsado (final).
5. **Subestados operativos** por etapa para control granular.
6. **Alertas de vencimiento**: aprobaciones por vencer (<60 días) y vencidos (<=0).
7. **Filtros y drill-down**: desde KPIs a listados filtrados por etapa/subestado, banco, ciudad, analista.
8. **Roles**: Analista / Coordinador / Administrador (permisos mínimos).

### 4.2 No objetivos (fase 1)
- Scoring / decisión crediticia bancaria.
- Integraciones de desembolso real con bancos.
- Gestión de servicios adicionales diferentes a crédito/leasing.
- Firma digital / orquestación legal bancaria (solo seguimiento de estado y documento).

---

## 5. Usuarios, roles y permisos
### 5.1 Roles
- **Analista**
  - Ver y gestionar casos asignados.
  - Cambiar subestado/etapa según permisos otorgados por Coordinador (opcional).
  - Subir documentos y registrar comentarios.
- **Coordinador**
  - Ver todo (todos los proyectos asignados o todos si se define).
  - Reasignar analistas.
  - Cambiar etapa/subestado.
  - Revisar KPIs y vencimientos para priorización.
- **Administrador**
  - CRUD de proyectos.
  - Gestión de usuarios/roles.
  - Configuración de catálogo de bancos/ciudades (si aplica).
  - Acceso completo.

### 5.2 Reglas de visibilidad
- **Por defecto**: Analista ve solo asignados.
- **Configurable**: Analista puede ver todos en lectura (si el negocio lo requiere), pero no editar no-asignados.

---

## 6. Modelo de proceso y estados
### 6.1 Etapas macro (obligatorias)
1. **Preaprobación**
2. **Aprobación**
3. **Legalización**
4. **Desembolsado** (etapa final)

### 6.2 Subestados por etapa (obligatorios)
**Preaprobación**
- Cliente no contesta
- Teléfono erróneo
- Cliente no existe
- Cliente contactado
- En gestión de preaprobación
- Preaprobado

**Aprobación**
- En gestión de documentos
- En estudio de aprobación
- Crédito aprobado

**Legalización**
- Crédito aprobado sin iniciar legalización
- Crédito en avalúo y estudio de títulos
- Crédito en firma de escritura
- Crédito en proceso de desembolso

**Desembolsado**
- Desembolsado

### 6.3 Reglas de transición (mínimas)
- Un caso solo puede tener **una etapa macro activa**.
- El subestado debe pertenecer a la etapa macro.
- Permitido “retroceder” etapa (por ejemplo de Legalización a Aprobación) solo por Coordinador/Admin.
- Al pasar a **Desembolsado**, el subestado queda “Desembolsado” y se considera cerrado (solo se permiten cambios administrativos con auditoría).

---

## 7. Requerimientos funcionales (FR)
> Formato: FR-XX — Título — Descripción — Prioridad (P0/P1/P2)

### 7.1 Proyectos
- **FR-01 — Crear proyecto (P0)**  
  Crear proyecto con: `ciudad`, `nombre_proyecto`, `banco_financiador_principal`.
- **FR-02 — Listar proyectos con KPIs (P0)**  
  Mostrar KPIs por proyecto: total clientes, conteos por etapa macro, aprobaciones por vencer (<60), vencidos.
- **FR-03 — Detalle de proyecto + tabs (P0)**  
  Tabs: Seguimiento (KPIs + subestados), Clientes (tabla), Vencimientos, Importaciones.

### 7.2 Importaciones (Excel)
- **FR-04 — Subir Excel por proyecto (P0)**  
  Carga .xlsx + selección de proyecto.  
- **FR-05 — Validación y reporte por fila (P0)**  
  Validar campos requeridos, tipos, formatos. Guardar errores por fila sin detener toda la carga.
- **FR-06 — Deduplicación por (proyecto + cédula) (P0)**  
  Si existe el cliente en el proyecto, actualizar campos según estrategia definida.
- **FR-07 — Historial de importaciones (P0)**  
  Listado de importaciones con métricas: insertados, actualizados, errores.
- **FR-08 — Descargar reporte de errores (P1)**  
  Exportar CSV/XLSX con filas fallidas y motivos.

### 7.3 Clientes / Casos
- **FR-09 — Listado de clientes (P0)**  
  Tabla densa con filtros: búsqueda, etapa, subestado, banco, ciudad, analistas, toggle “solo <60”.
- **FR-10 — Detalle del cliente (P0)**  
  Vista drawer/página con: datos cliente/inmueble/financieros, documentos, asignaciones, historial.
- **FR-11 — Asignaciones (P0)**  
  Asignar: analista_delta, analista_radicacion_habicredit, analista_legalizacion.
- **FR-12 — Cambiar estado (P0)**  
  Cambiar etapa/subestado (según rol). Registrar auditoría.
- **FR-13 — Cambio de banco con historial (P0)**  
  Actualizar `banco_actual` y registrar evento (de→a, usuario, timestamp). No perder documentos.
- **FR-14 — Comentarios (P1)**  
  Permitir comentarios en eventos (ej. motivo de cambio).

### 7.4 Documentos
- **FR-15 — Subir carta de preaprobación (P0)**  
  Upload de archivo asociado al caso.
- **FR-16 — Subir carta de aprobación (P0)**  
  Upload de archivo asociado al caso con `fecha_carta_aprobación` y `vigencia_días`.
- **FR-17 — Descargar documento (P0)**  
  Link de descarga con control de permisos.
- **FR-18 — Estado documental (P1)**  
  “Cargado / No cargado” por tipo.

### 7.5 Vencimientos y alertas
- **FR-19 — Cálculo de vencimiento (P0)**  
  `fecha_vencimiento = fecha_carta_aprobación + vigencia_días`  
  `días_restantes = fecha_vencimiento - fecha_actual`
- **FR-20 — KPI “por vencer <60” (P0)**  
  En dashboard global y de proyecto.
- **FR-21 — Vista de vencimientos (P0)**  
  Tabla con rangos: <=0, 1–15, 16–30, 31–60, >60 + drill-down.
- **FR-22 — Notificación UI (P1)**  
  Badge/indicador y toast al cambiar datos que impacten vencimientos.

### 7.6 Usuarios y roles
- **FR-23 — CRUD usuarios (P1)**  
  Admin crea/edita/activa/desactiva usuarios.
- **FR-24 — Asignar roles (P1)**  
  Admin asigna rol. Coordinador no puede cambiar roles.

---

## 8. Requerimientos no funcionales (NFR)
- **NFR-01 Seguridad:** autenticación obligatoria; autorización por rol.  
- **NFR-02 Auditoría:** registrar cambios críticos (estado, banco, asignaciones, documentos).  
- **NFR-03 Rendimiento:** listados deben cargar en <2s para 5k registros por proyecto (paginación + filtros server-side).  
- **NFR-04 Escalabilidad:** soportar múltiples proyectos y cargas recurrentes sin degradación.  
- **NFR-05 Observabilidad:** logs de importación, errores de validación, y trazabilidad de eventos.  
- **NFR-06 Resiliencia:** importación debe ser robusta ante filas corruptas.  
- **NFR-07 Cumplimiento:** manejo cuidadoso de datos personales (cédula, fecha nacimiento).

---

## 9. UX / UI (lineamientos para implementación)
### 9.1 Navegación
Sidebar:
- Dashboard
- Proyectos
- Importaciones
- Clientes
- Vencimientos
- Usuarios y Roles (Admin)

Topbar:
- Buscador por cédula/nombre
- Selector de proyecto (rápido)
- Perfil + rol
- Notificaciones (contador vencimientos)

### 9.2 Vistas críticas
- **Dashboard global:** KPIs + tabla “Top por vencer”
- **Detalle proyecto:** KPIs por etapa + subestados con clic (drill-down)
- **Listado clientes:** tabla densa con filtros sticky
- **Detalle cliente (drawer):** tabs Resumen / Documentos / Historial / Asignaciones
- **Importaciones:** upload + historial + detalle errores

---

## 10. Modelo de datos (propuesto)
> Nota: se sugiere separar “Cliente” (persona) y “Caso” (cliente dentro de un proyecto con variables financieras/banco/estado), para soportar histórico y multi-proyecto.

### 10.1 Entidades
- **Project**
  - id, ciudad, nombre, banco_financiador_principal, created_at
- **Person (Cliente)**
  - id, cedula (única global), nombres, apellidos, fecha_nacimiento, ciudad_cliente, created_at
- **Case (CasoFinanciación)**
  - id, project_id, person_id
  - etapa_macro, subestado
  - banco_actual
  - ciudad_inmueble
  - monto_inmueble
  - monto_a_financiar
  - fecha_carta_aprobacion (nullable)
  - vigencia_dias (nullable)
  - fecha_vencimiento (derivable o almacenada)
  - created_at, updated_at
- **Assignments**
  - case_id, analista_delta_id, analista_radicacion_id, analista_legalizacion_id
- **Document**
  - id, case_id, tipo (preaprobacion|aprobacion), file_url, uploaded_by, uploaded_at
- **Import**
  - id, project_id, file_url, uploaded_by, uploaded_at, inserted_count, updated_count, error_count
- **ImportRowError**
  - id, import_id, row_number, field, message, raw_value
- **EventLog (Auditoría)**
  - id, case_id, type (STATUS_CHANGED|BANK_CHANGED|ASSIGNMENT_CHANGED|DOC_UPLOADED|IMPORTED_UPDATED)
  - payload_json (from/to), actor_user_id, created_at

### 10.2 Índices recomendados
- Person.cedula (unique)
- Case(project_id, person_id) (unique)
- Case(project_id, etapa_macro, subestado)
- Case(project_id, banco_actual)
- Case(project_id, fecha_vencimiento)

---

## 11. API (borrador de endpoints)
### 11.1 Proyectos
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `GET /projects/:id/kpis`
- `GET /projects/:id/clients` (listado con filtros server-side)

### 11.2 Clientes/Casos
- `GET /cases/:id`
- `PATCH /cases/:id` (actualizaciones generales)
- `POST /cases/:id/status` (cambio etapa/subestado + comentario opcional)
- `POST /cases/:id/bank-change` (nuevo banco + motivo)
- `POST /cases/:id/assignments` (reasignación)

### 11.3 Documentos
- `POST /cases/:id/documents` (upload + tipo)
- `GET /documents/:id/download`

### 11.4 Importaciones
- `POST /imports` (project_id + file)
- `GET /imports?project_id=`
- `GET /imports/:id`
- `GET /imports/:id/errors`
- `GET /imports/:id/errors/export`

### 11.5 Vencimientos
- `GET /alerts/expirations` (global)
- `GET /projects/:id/expirations`

---

## 12. Lógica de negocio (detallada)
### 12.1 Cálculo de vencimiento
- Solo aplica si hay `fecha_carta_aprobacion` y `vigencia_dias`.
- `fecha_vencimiento = fecha_carta_aprobacion + vigencia_dias`
- `dias_restantes = fecha_vencimiento - hoy`
- Estados derivados:
  - `vencido = dias_restantes <= 0`
  - `por_vencer = 0 < dias_restantes < 60`
  - `ok = dias_restantes >= 60`

### 12.2 Cambio de banco
- Permitido a Coordinador/Admin (Analista solo si se habilita).
- Al cambiar:
  - update `banco_actual`
  - registrar `EventLog` con from/to
  - no borrar documentos
  - opcional: guardar `banco_al_momento_del_documento` si se requiere en futuro (no fase 1)

### 12.3 Estrategia de actualización en importación
- Si el caso existe (project + cedula):
  - Actualizar campos “no críticos” si vienen no vacíos (ej. ciudades, montos, banco_actual).
  - No sobrescribir manuales recientes sin auditoría (opcional): guardar evento “IMPORTED_UPDATED”.
- Si no existe:
  - Crear Person si cedula no existe.
  - Crear Case + Assignments vacíos.

---

## 13. Analytics / Métricas (MVP)
### 13.1 Métricas producto
- # proyectos activos
- # clientes totales por proyecto
- Distribución por etapa macro y subestados
- # aprobaciones por vencer (<60) y vencidas
- Tiempo promedio en etapa (si se registra `entered_at` por etapa, P1)

### 13.2 Métricas operativas por rol
- Casos por analista
- Casos por vencer asignados por analista
- Cambios de estado por semana (volumen)

---

## 14. Plan de releases (propuesto)
### Release 1 (MVP, P0)
- Proyectos (CRUD básico)
- Importación Excel + errores por fila + deduplicación
- Casos: listado + filtros + detalle
- Estados: etapas+subestados + auditoría
- Documentos: upload/descarga de cartas
- Vencimientos: cálculo + KPIs + vistas
- Roles: Analista/Coordinador/Admin (permisos mínimos)

### Release 2 (P1)
- Exportar listados (CSV)
- Reporte de errores descargable
- Comentarios obligatorios en cambios sensibles
- Configuración de visibilidad (analista read-only de todo)
- Campos adicionales de inmueble (si se requieren)

---

## 15. Riesgos y mitigaciones
- **Variación de Excel** → Mitigar con plantilla estándar + mapeo configurable + validación por fila.
- **Duplicados/inconsistencias** → Mitigar con clave (project+cedula) y auditoría de importación.
- **Definición de permisos** → Mitigar con políticas por rol + pruebas de autorización.
- **Cálculo erróneo de vencimiento** → Mitigar con tests unitarios y visualización clara (fecha_vencimiento y dias_restantes).
- **Datos sensibles** → Mitigar con control de acceso y logs.

---

## 16. Fuera de alcance explícito (recordatorio)
- Decisión crediticia o scoring bancario.
- Integraciones de pagos/desembolso.
- Servicios adicionales (más allá de crédito/leasing).

---

## 17. Conclusiones
Esta plataforma ataca un problema crítico y urgente de Delta Brokers: el control operativo de clientes de financiación por proyecto, con riesgos de vencimiento. El diseño por etapas macro + subestados, importación robusta desde Excel, trazabilidad completa (auditoría), documentos y alertas de vencimiento conforman un MVP claro, implementable y escalable. La separación Cliente/Case permite crecimiento multi-proyecto y manejo correcto del cambio de banco con historial sin perder información.

---

## 18. Apéndice A — Campos de cliente (definición)
### Datos del cliente
- Nombres, Apellidos
- Cédula
- Fecha de nacimiento
- Ciudad del cliente

### Datos del inmueble
- Ciudad del inmueble
- Monto del inmueble

### Datos financieros
- Monto a financiar
- Banco actual
- Etapa macro
- Subestado
- Carta de preaprobación (archivo)
- Carta de aprobación (archivo)
- Fecha carta de aprobación
- Vigencia (días)
- Fecha vencimiento (calculada)
- Días restantes (calculada)
- Analista Delta asignado
- Analista Radicación HabiCredit asignado
- Analista Legalización asignado
- Monto aprobado
- Monto desembolsado