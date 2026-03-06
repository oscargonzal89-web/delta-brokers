# Task List — Delta Brokers Credit Ops (Fase 1 MVP)

> Generado desde: `PRD.md` (v1.0, 2026-03-03)
> Stack: React + Vite + Tailwind (front) | Supabase (back: auth, DB, storage, edge functions)
> Supabase Project ID: `hwjiasyyqfpalsufjuai`
> Estado actual: Frontend descargado desde Figma Make con mock data. Backend no iniciado.

---

## Relevant Files

### Backend (Supabase — migraciones SQL)
- `supabase/migrations/001_initial_schema.sql` - Migración inicial: enums, tablas projects, persons, cases, assignments, documents, imports, import_row_errors, event_logs con relaciones, constraints e índices
- `supabase/migrations/002_rls_policies.sql` - Row Level Security: políticas de acceso por rol (analista, coordinador, admin)
- `supabase/migrations/003_functions_triggers.sql` - Funciones: cálculo automático de vencimiento, auditoría de cambios, validación de transiciones de estado
- `supabase/migrations/004_views.sql` - Vistas SQL: dashboard KPIs, vencimientos por rango, seguimiento por analista, conteos por subestado
- `supabase/migrations/005_seed_data.sql` - Datos semilla: catálogos (bancos, ciudades), subestados por etapa, usuario admin
- `supabase/migrations/006_storage.sql` - Buckets de storage para cartas de preaprobación y aprobación

### Backend (Supabase — Edge Functions)
- `supabase/functions/import-excel/index.ts` - Edge function: parseo Excel, validación por fila, deduplicación (project+cedula), reporte de errores

### Frontend (nuevos archivos)
- `src/lib/supabase.ts` - Cliente Supabase inicializado con project URL y anon key
- `src/lib/auth.tsx` - AuthProvider context, hook useAuth, protección de rutas por rol
- `src/lib/api/projects.ts` - CRUD proyectos + KPIs agregados
- `src/lib/api/cases.ts` - CRUD casos, cambio de estado, cambio de banco, asignaciones
- `src/lib/api/imports.ts` - Upload Excel, historial de importaciones, errores por importación
- `src/lib/api/documents.ts` - Upload/download de cartas a Supabase Storage
- `src/lib/api/users.ts` - CRUD usuarios, asignación de roles
- `src/lib/api/analytics.ts` - Queries para dashboard, vencimientos, seguimiento analistas
- `src/lib/types.ts` - Tipos TypeScript generados desde el schema de Supabase

### Frontend (archivos a modificar)
- `src/app/pages/Login.tsx` - Reemplazar mock auth por Supabase Auth
- `src/app/pages/Dashboard.tsx` - Queries reales + paginación
- `src/app/pages/Proyectos.tsx` - CRUD real
- `src/app/pages/ProyectoDetalle.tsx` - Queries reales con tabs
- `src/app/pages/Clientes.tsx` - Queries con filtros server-side + paginación
- `src/app/pages/Vencimientos.tsx` - Queries reales por rango
- `src/app/pages/Importaciones.tsx` - Upload real + edge function
- `src/app/pages/Usuarios.tsx` - CRUD real con Supabase Auth Admin
- `src/app/pages/SeguimientoAnalistas.tsx` - Queries reales
- `src/app/components/ClienteDetalle.tsx` - Tabs con datos reales (documentos, historial, asignaciones)
- `src/app/components/AppLayout.tsx` - Integrar auth context, mostrar usuario real, proteger sidebar por rol
- `src/app/data/mock-data.ts` - Eliminar al final cuando todo esté conectado

### Notes
- Supabase Project ID: `hwjiasyyqfpalsufjuai`
- MCP de Supabase pendiente de conectar. Las migraciones se pueden ejecutar via Supabase CLI o dashboard SQL Editor.
- Tests con Vitest para frontend.
- Edge Functions corren en Deno runtime (Supabase).
- Seguir proceso de `Process_task.md`: un sub-task a la vez, pedir permiso antes de avanzar al siguiente.

---

## Tasks

- [x] 0.0 Inicializar repositorio Git y configuración del proyecto
  - [x] 0.1 Crear `.gitignore` (node_modules, dist, .env, .DS_Store, etc.)
  - [x] 0.2 Inicializar repo Git en `/repos/DeltaBrokers`
  - [x] 0.3 Commit inicial con todo el código actual (frontend Figma + migraciones Supabase + task list)
  - [x] 0.4 Crear repositorio remoto en GitHub y push inicial — https://github.com/oscargonzal89-web/delta-brokers

- [x] 1.0 Configurar proyecto Supabase y estructura de base de datos
  - [x] 1.1 Inicializar Supabase en el proyecto remoto (`hwjiasyyqfpalsufjuai`) — Configurado via MCP, 6 migraciones aplicadas
  - [x] 1.2 Crear migración `001_initial_schema.sql`: definir tipos ENUM para etapa_macro (`preaprobacion`, `aprobacion`, `legalizacion`, `desembolsado`), subestado, tipo_documento, tipo_evento, rol_usuario
  - [x] 1.3 Crear tabla `projects` (id UUID PK, ciudad, nombre, banco_financiador_principal, created_at, updated_at)
  - [x] 1.4 Crear tabla `persons` (id UUID PK, cedula UNIQUE NOT NULL, nombres, apellidos, fecha_nacimiento, ciudad_cliente, created_at)
  - [x] 1.5 Crear tabla `cases` (id UUID PK, project_id FK, person_id FK, etapa_macro ENUM, subestado TEXT, banco_actual, ciudad_inmueble, monto_inmueble, monto_a_financiar, monto_aprobado, monto_desembolsado, fecha_carta_aprobacion, vigencia_dias, fecha_vencimiento GENERATED, created_at, updated_at) con UNIQUE(project_id, person_id)
  - [x] 1.6 Crear tabla `assignments` (id UUID PK, case_id FK UNIQUE, analista_delta_id FK, analista_radicacion_id FK, analista_legalizacion_id FK, updated_at)
  - [x] 1.7 Crear tabla `documents` (id UUID PK, case_id FK, tipo ENUM, file_url, file_name, fecha_carta_aprobacion, vigencia_dias, uploaded_by FK, uploaded_at)
  - [x] 1.8 Crear tabla `imports` (id UUID PK, project_id FK, file_url, file_name, uploaded_by FK, uploaded_at, inserted_count, updated_count, error_count, status)
  - [x] 1.9 Crear tabla `import_row_errors` (id UUID PK, import_id FK, row_number INT, field TEXT, message TEXT, raw_value TEXT)
  - [x] 1.10 Crear tabla `event_logs` (id UUID PK, case_id FK, event_type ENUM, payload JSONB, comment TEXT, actor_user_id FK, created_at)
  - [x] 1.11 Crear índices según PRD §10.2: persons(cedula), cases(project_id, person_id), cases(project_id, etapa_macro, subestado), cases(project_id, banco_actual), cases(project_id, fecha_vencimiento)

- [x] 2.0 Configurar Row Level Security (RLS) y políticas de acceso por rol
  - [x] 2.1 Crear migración `002_rls_policies.sql`: habilitar RLS en todas las tablas
  - [x] 2.2 Crear tabla `user_profiles` (id FK auth.users, nombre, rol ENUM, activo BOOLEAN, created_at) que extiende auth.users con rol y metadata — **incluida en 001**
  - [x] 2.3 Crear función helper `get_user_role()` que retorna el rol del usuario autenticado
  - [x] 2.4 Políticas para `projects`: SELECT para todos los autenticados, INSERT/UPDATE/DELETE solo Admin
  - [x] 2.5 Políticas para `persons` y `cases`: SELECT para todos, INSERT/UPDATE según rol (Analista solo asignados, Coordinador/Admin todos)
  - [x] 2.6 Políticas para `assignments`: SELECT todos, UPDATE solo Coordinador/Admin
  - [x] 2.7 Políticas para `documents`: SELECT todos, INSERT para Analista asignado + Coordinador/Admin
  - [x] 2.8 Políticas para `imports`: SELECT todos, INSERT solo Coordinador/Admin
  - [x] 2.9 Políticas para `event_logs`: SELECT todos, INSERT automático (via trigger/función)
  - [x] 2.10 Políticas para `user_profiles`: SELECT todos, INSERT/UPDATE/DELETE solo Admin

- [x] 3.0 Crear funciones SQL y triggers de lógica de negocio
  - [x] 3.1 Crear migración `003_functions_triggers.sql`
  - [x] 3.2 Función `calculate_fecha_vencimiento()`: columna GENERATED en `cases` que calcula `fecha_vencimiento = fecha_carta_aprobacion + vigencia_dias`
  - [x] 3.3 Función `log_status_change()`: trigger AFTER UPDATE en `cases` que registra en `event_logs` cuando cambia `etapa_macro` o `subestado` (guarda from/to en payload JSONB)
  - [x] 3.4 Función `log_bank_change()`: trigger AFTER UPDATE en `cases` que registra en `event_logs` cuando cambia `banco_actual` (guarda banco anterior y nuevo)
  - [x] 3.5 Función `log_assignment_change()`: trigger AFTER UPDATE en `assignments` que registra en `event_logs` cambios de analistas
  - [x] 3.6 Función `validate_subestado_for_etapa()`: trigger BEFORE INSERT/UPDATE en `cases` que valida que el subestado pertenezca a la etapa_macro según regla §6.3
  - [x] 3.7 Función `handle_new_user()`: trigger que crea registro en `user_profiles` cuando se registra un usuario en auth
  - [x] 3.8 Función RPC `change_case_status()`: cambiar etapa+subestado con comentario opcional
  - [x] 3.9 Función RPC `change_case_bank()`: cambiar banco con motivo opcional

- [x] 4.0 Configurar Supabase Storage para documentos
  - [x] 4.1 Crear migración `006_storage.sql`: bucket `documents` con carpetas por caso (case_id/tipo/)
  - [x] 4.2 Configurar políticas de storage: upload solo usuarios autenticados, download autenticados, delete Coordinador/Admin
  - [x] 4.3 Configurar límites: max file size 10MB, tipos permitidos (PDF, JPG, PNG, WebP)

- [x] 5.0 Crear datos semilla (seed) y vistas SQL
  - [x] 5.1 Crear migración `004_views.sql`: vista `v_cases_with_details` que une cases + persons + projects + assignments para queries del dashboard
  - [x] 5.2 Vista `v_dashboard_kpis`: conteos por etapa_macro, por vencer (<60 días), vencidos (<=0) agrupados por proyecto
  - [x] 5.3 Vista `v_vencimientos_por_rango`: clasifica casos en rangos (<=0, 1-15, 16-30, 31-60, >60)
  - [x] 5.4 Vista `v_seguimiento_analistas`: casos agrupados por analista_delta con conteos y vencimientos
  - [x] 5.5 Crear migración `005_seed_data.sql`: catálogo de subestados por etapa según PRD §6.2 (14 subestados)
  - [ ] 5.6 Crear usuario admin inicial (admin@deltabrokers.co) — **PENDIENTE: ejecutar en Supabase Auth**

- [x] 6.0 Integrar Supabase Auth en el frontend (Login + protección de rutas)
  - [x] 6.1 Instalar dependencia `@supabase/supabase-js` y crear `src/lib/supabase.ts` con URL y anon key del proyecto
  - [x] 6.2 Crear `src/lib/auth.tsx`: AuthProvider con context (user, profile, role, loading, signIn, signOut)
  - [x] 6.3 Crear hook `useAuth()` para acceso al contexto desde cualquier componente
  - [x] 6.4 Crear componente `ProtectedRoute` que redirige a /login si no hay sesión
  - [x] 6.5 Adaptar `Login.tsx`: reemplazar autenticación mock por `supabase.auth.signInWithPassword()`
  - [x] 6.6 Adaptar `AppLayout.tsx`: mostrar nombre y rol real del usuario, logout real, ocultar items de sidebar según rol
  - [x] 6.7 Envolver `routes.tsx` con AuthProvider y proteger rutas con ProtectedRoute

- [x] 7.0 Crear capa de API del frontend (lib/api)
  - [x] 7.1 Crear `src/lib/types.ts` con tipos TypeScript generados desde Supabase (Project, Person, Case, Assignment, Document, Import, EventLog, UserProfile + Views + Enums)
  - [x] 7.2 Crear `src/lib/api/projects.ts`: getProjects(), getProjectById(), createProject(), updateProject(), getProjectKpis(), getSubestadosPorProyecto()
  - [x] 7.3 Crear `src/lib/api/cases.ts`: getCases() con filtros y paginación server-side, getCaseById(), changeCaseStatus(), changeCaseBank(), updateAssignment(), getCaseEventLogs(), getSubestados()
  - [x] 7.4 Crear `src/lib/api/imports.ts`: uploadExcel() via Edge Function, getImports(), getImportById(), getImportErrors()
  - [x] 7.5 Crear `src/lib/api/documents.ts`: uploadDocument() con Storage + metadata, downloadDocument() con signed URL, deleteDocument(), getDocumentsByCase()
  - [x] 7.6 Crear `src/lib/api/users.ts`: getUsers(), getAnalistas(), getUserById(), updateUserRole(), toggleUserActive(), updateUserProfile()
  - [x] 7.7 Crear `src/lib/api/analytics.ts`: getDashboardKpis(), getVencimientosPorRango(), getSeguimientoAnalistas(), getTopPorVencer(), getVencimientosCriticos()

- [ ] 8.0 Conectar página de Proyectos a datos reales
  - [ ] 8.1 Adaptar `Proyectos.tsx`: reemplazar import de mock por llamadas a `getProjects()` y `getProjectKpis()`
  - [ ] 8.2 Implementar creación real de proyecto con `createProject()` en el dialog
  - [ ] 8.3 Adaptar `ProyectoDetalle.tsx`: cargar proyecto, clientes, importaciones y KPIs desde Supabase
  - [ ] 8.4 Implementar gráfico de embudo con datos reales (recharts)
  - [ ] 8.5 Verificar navegación y estados de carga (loading, error, empty)

- [ ] 9.0 Conectar página de Clientes a datos reales con paginación server-side
  - [ ] 9.1 Adaptar `Clientes.tsx`: reemplazar mock por `getCases()` con filtros server-side (etapa, subestado, banco, ciudad, analista, búsqueda texto)
  - [ ] 9.2 Implementar paginación server-side (offset/limit) para cumplir NFR-03 (<2s con 5k registros)
  - [ ] 9.3 Adaptar `ClienteDetalle.tsx` tab Resumen: cargar datos reales del caso + persona
  - [ ] 9.4 Adaptar tab Documentos: listar documentos reales, upload de cartas con `uploadDocument()`
  - [ ] 9.5 Adaptar tab Historial: cargar event_logs reales del caso
  - [ ] 9.6 Adaptar tab Asignaciones: cargar y actualizar asignaciones reales con `updateAssignments()`
  - [ ] 9.7 Implementar cambio de estado real con `updateCaseStatus()` y registro de auditoría
  - [ ] 9.8 Implementar cambio de banco real con `changeCaseBank()` y historial

- [ ] 10.0 Conectar funcionalidad de Importación Excel
  - [ ] 10.1 Crear Edge Function `supabase/functions/import-excel/index.ts`: recibir archivo + project_id, parsear XLSX
  - [ ] 10.2 Implementar validación por fila: campos requeridos (nombre, cedula, banco_actual, etapa, subestado), tipos, formatos
  - [ ] 10.3 Implementar deduplicación por (project_id + cedula): si existe → update campos no críticos, si no → insert Person + Case
  - [ ] 10.4 Registrar import en tabla `imports` con contadores (inserted_count, updated_count, error_count)
  - [ ] 10.5 Registrar errores por fila en `import_row_errors` sin detener la carga
  - [ ] 10.6 Adaptar `Importaciones.tsx`: upload real llamando a la Edge Function, mostrar progreso
  - [ ] 10.7 Implementar historial de importaciones desde tabla `imports`
  - [ ] 10.8 Implementar detalle de errores desde tabla `import_row_errors`

- [ ] 11.0 Conectar página de Documentos (upload/download de cartas)
  - [ ] 11.1 Adaptar upload en `ClienteDetalle.tsx`: subir archivo a Supabase Storage bucket `documents/{case_id}/{tipo}/`
  - [ ] 11.2 Registrar documento en tabla `documents` con metadata (tipo, fecha_carta, vigencia, uploaded_by)
  - [ ] 11.3 Al subir carta de aprobación: actualizar `cases.fecha_carta_aprobacion` y `cases.vigencia_dias` (trigger calcula vencimiento)
  - [ ] 11.4 Implementar descarga de documentos con URL firmada (`createSignedUrl`)
  - [ ] 11.5 Mostrar estado documental en detalle del caso (carta preaprobación: cargada/no, carta aprobación: cargada/no)

- [ ] 12.0 Conectar Dashboard y Vencimientos a datos reales
  - [ ] 12.1 Adaptar `Dashboard.tsx`: KPIs desde vista `v_dashboard_kpis`, tabla "Top por Vencer" desde query con ORDER BY dias_restantes
  - [ ] 12.2 Implementar filtros del dashboard (proyecto, ciudad, banco, analista) como parámetros de query
  - [ ] 12.3 Implementar drill-down desde KPIs a página de Clientes con filtros pre-aplicados (ya funciona con URL params)
  - [ ] 12.4 Adaptar `Vencimientos.tsx`: queries por rango (<=0, 1-15, 16-30, 31-60, >60) desde vista `v_vencimientos_por_rango`
  - [ ] 12.5 Implementar badge de notificación en sidebar con contador de vencimientos críticos (<15 días)

- [ ] 13.0 Conectar Seguimiento Analistas y Usuarios a datos reales
  - [ ] 13.1 Adaptar `SeguimientoAnalistas.tsx`: query desde vista `v_seguimiento_analistas` con filtros (analista, proyecto, ciudad)
  - [ ] 13.2 Adaptar tarjetas resumen por analista con datos reales (total créditos, por vencer, vencidos)
  - [ ] 13.3 Adaptar `Usuarios.tsx`: CRUD real con `getUsers()`, `createUser()`, `updateUser()`
  - [ ] 13.4 Implementar creación de usuario con `supabase.auth.admin.createUser()` + registro en `user_profiles`
  - [ ] 13.5 Implementar activar/desactivar usuario (toggle `activo` en user_profiles + disable en auth)
  - [ ] 13.6 Implementar asignación de roles (solo Admin puede cambiar roles)

- [ ] 14.0 Testing, QA y ajustes finales
  - [ ] 14.1 Probar flujo completo de login → dashboard → navegar cada sección
  - [ ] 14.2 Probar creación de proyecto → importación Excel → verificar clientes creados
  - [ ] 14.3 Probar cambio de estado y banco con verificación de auditoría en event_logs
  - [ ] 14.4 Probar upload/download de cartas de aprobación y verificar cálculo de vencimiento
  - [ ] 14.5 Probar permisos: Analista no puede hacer operaciones de Coordinador/Admin
  - [ ] 14.6 Probar importación masiva (500+ filas) y verificar rendimiento (<2s en listados)
  - [ ] 14.7 Verificar vencimientos: rangos correctos, alertas en dashboard, drill-down funcional
  - [ ] 14.8 Eliminar `src/app/data/mock-data.ts` y todas las referencias a mock data
  - [ ] 14.9 Revisión UX final: loading states, error handling, empty states, responsive
  - [ ] 14.10 Deploy a producción (build + Supabase project activo)
