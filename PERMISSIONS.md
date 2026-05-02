# Workforce App — Setup de Permisos, Grupos y Roles

Seguir los pasos en orden. Completar los `{{placeholder}}` con los IDs que devuelva cada POST antes de continuar al paso siguiente.

---

## Placeholders

### App y empresa

| Variable | Valor |
|---|---|
| `{{app_id}}` | `70d6ecaa-2503-4053-aaa2-23fbe6e1e370` |
| `{{plan_id}}` | *(completar)* |
| `{{company_id}}` | `5` |

### IDs de grupos (completar despues del Paso 1)

| Variable | Descripcion |
|---|---|
| `{{group_acceso_general}}` | ID del grupo WF Acceso General |
| `{{group_operador}}` | ID del grupo WF Operador |
| `{{group_supervisor}}` | ID del grupo WF Supervisor |
| `{{group_mantenedor}}` | ID del grupo WF Mantenedor |
| `{{group_reporteria}}` | ID del grupo WF Reporteria |

### IDs de permisos (completar despues del Paso 2)

| Variable | Permiso |
|---|---|
| `{{perm_patio_ver}}` | Patio: Ver |
| `{{perm_cargadores_lista}}` | Cargadores: Ver lista |
| `{{perm_cargadores_detalle}}` | Cargadores: Ver detalle |
| `{{perm_sesiones_historial}}` | Sesiones: Ver historial |
| `{{perm_perfil_ver}}` | Perfil: Ver |
| `{{perm_op_iniciar}}` | Operaciones: Iniciar carga |
| `{{perm_op_detener}}` | Operaciones: Detener carga |
| `{{perm_op_desbloquear}}` | Operaciones: Desbloquear conector |
| `{{perm_sesiones_activas}}` | Sesiones: Ver activas |
| `{{perm_tecle_ver}}` | Tecle: Ver |
| `{{perm_tecle_operar}}` | Tecle: Operar |
| `{{perm_sup_kpis}}` | Supervision: Ver KPIs operacionales |
| `{{perm_sup_alertas}}` | Supervision: Ver alertas y fallas |
| `{{perm_sup_estado}}` | Supervision: Ver estado general del patio |
| `{{perm_sup_energia}}` | Supervision: Ver resumen energetico |
| `{{perm_rep_sesiones}}` | Reporteria: Ver sesiones de carga |
| `{{perm_rep_consumo}}` | Reporteria: Ver consumo por sitio |
| `{{perm_mant_variables}}` | Mantenimiento: Ver variables energeticas |
| `{{perm_mant_ocpp_msgs}}` | Mantenimiento: Ver mensajes OCPP |
| `{{perm_mant_ocpp_ver}}` | Mantenimiento: Ver configuracion OCPP |
| `{{perm_mant_ocpp_editar}}` | Mantenimiento: Editar configuracion OCPP |
| `{{perm_mant_reset}}` | Mantenimiento: Reiniciar cargador |
| `{{perm_mant_panel}}` | Mantenimiento: Ver panel energetico en tiempo real |
| `{{perm_rep_variables_hist}}` | Reporteria: Ver variables energeticas historicas |
| `{{perm_rep_ocpp_hist}}` | Reporteria: Ver mensajes OCPP historicos |
| `{{perm_rep_uptime}}` | Reporteria: Ver uptime de cargadores |

### IDs de roles (completar despues del Paso 3)

| Variable | Descripcion |
|---|---|
| `{{role_operador}}` | ID del rol wf_operador |
| `{{role_supervisor}}` | ID del rol wf_supervisor |
| `{{role_mantenedor}}` | ID del rol wf_mantenedor |

---

## Paso 1 — Crear grupos de permisos

`POST /api/permission-groups`

```json
{
  "name": "WF Acceso General",
  "code": "wf_acceso_general",
  "planId": "{{plan_id}}",
  "description": "Permisos base requeridos por todos los roles de la Workforce App",
  "parentId": null
}
```

```json
{
  "name": "WF Operador",
  "code": "wf_operador",
  "planId": "{{plan_id}}",
  "description": "Permisos de operacion de cargas y tecles",
  "parentId": null
}
```

```json
{
  "name": "WF Supervisor",
  "code": "wf_supervisor",
  "planId": "{{plan_id}}",
  "description": "Permisos de monitoreo, KPIs y supervision del patio",
  "parentId": null
}
```

```json
{
  "name": "WF Mantenedor",
  "code": "wf_mantenedor",
  "planId": "{{plan_id}}",
  "description": "Permisos de acceso tecnico, variables energeticas y configuracion OCPP",
  "parentId": null
}
```

```json
{
  "name": "WF Reporteria",
  "code": "wf_reporteria",
  "planId": "{{plan_id}}",
  "description": "Permisos de reportes historicos compartidos entre Supervisor y Mantenedor",
  "parentId": null
}
```

---

## Paso 2 — Crear permisos

`POST /api/permissions`

### Grupo: Acceso General — `{{group_acceso_general}}`

```json
{
  "name": "Patio: Ver",
  "description": "Ver la vista principal del patio con listado de cargadores y estado general",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_acceso_general}}"
}
```

```json
{
  "name": "Cargadores: Ver lista",
  "description": "Ver el listado de cargadores del patio con su estado de conexion",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_acceso_general}}"
}
```

```json
{
  "name": "Cargadores: Ver detalle",
  "description": "Ver el detalle de un cargador individual con conectores y estado en tiempo real",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_acceso_general}}"
}
```

```json
{
  "name": "Sesiones: Ver historial",
  "description": "Ver el historial de sesiones de carga de la ubicacion seleccionada",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_acceso_general}}"
}
```

```json
{
  "name": "Perfil: Ver",
  "description": "Ver y editar el perfil del usuario autenticado",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_acceso_general}}"
}
```

### Grupo: Operador — `{{group_operador}}`

```json
{
  "name": "Operaciones: Iniciar carga",
  "description": "Enviar comando de inicio de carga a un conector via OCPP (create-registry + start-charge)",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

```json
{
  "name": "Operaciones: Detener carga",
  "description": "Enviar comando de detencion de carga a un conector activo via OCPP",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

```json
{
  "name": "Operaciones: Desbloquear conector",
  "description": "Enviar comando de desbloqueo de conector a un cargador via OCPP",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

```json
{
  "name": "Sesiones: Ver activas",
  "description": "Ver sesiones de carga activas en tiempo real en la vista del operador",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

```json
{
  "name": "Tecle: Ver",
  "description": "Ver el panel de control de tecles en la vista operador",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

```json
{
  "name": "Tecle: Operar",
  "description": "Ejecutar comandos de subida/bajada de tecle (ramp) en conectores seleccionados",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_operador}}"
}
```

### Grupo: Supervisor — `{{group_supervisor}}`

```json
{
  "name": "Supervision: Ver KPIs operacionales",
  "description": "Ver indicadores de rendimiento operacional del patio",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

```json
{
  "name": "Supervision: Ver alertas y fallas",
  "description": "Ver conectores en estado faulted y suspended con conteo de incidencias",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

```json
{
  "name": "Supervision: Ver estado general del patio",
  "description": "Ver resumen de salud del patio (cargadores sanos, con fallas, suspendidos)",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

```json
{
  "name": "Supervision: Ver resumen energetico",
  "description": "Ver voltaje promedio, corriente promedio, potencia total y energia total del patio",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

```json
{
  "name": "Reporteria: Ver sesiones de carga",
  "description": "Ver historial detallado de sesiones con filtros por fecha y cargador",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

```json
{
  "name": "Reporteria: Ver consumo por sitio",
  "description": "Ver estadisticas de consumo energetico agregado por sitio",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_supervisor}}"
}
```

### Grupo: Mantenedor — `{{group_mantenedor}}`

```json
{
  "name": "Mantenimiento: Ver variables energeticas",
  "description": "Ver historial de variables energeticas (voltaje, corriente, potencia, temperatura) con grafico de los ultimos 30 minutos",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

```json
{
  "name": "Mantenimiento: Ver mensajes OCPP",
  "description": "Ver el log de mensajes OCPP intercambiados entre el cargador y el servidor",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

```json
{
  "name": "Mantenimiento: Ver configuracion OCPP",
  "description": "Ver los parametros de configuracion OCPP activos en el cargador",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

```json
{
  "name": "Mantenimiento: Editar configuracion OCPP",
  "description": "Modificar parametros de configuracion OCPP en el cargador (ChangeConfiguration)",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

```json
{
  "name": "Mantenimiento: Reiniciar cargador",
  "description": "Enviar comando de reinicio (Reset) al cargador via OCPP",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

```json
{
  "name": "Mantenimiento: Ver panel energetico en tiempo real",
  "description": "Ver voltaje, corriente, potencia y temperatura por conector con polling cada 3s",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_mantenedor}}"
}
```

### Grupo: Reporteria — `{{group_reporteria}}`

```json
{
  "name": "Reporteria: Ver variables energeticas historicas",
  "description": "Acceder al historial de variables energeticas de los ultimos 30 minutos por conector",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_reporteria}}"
}
```

```json
{
  "name": "Reporteria: Ver mensajes OCPP historicos",
  "description": "Consultar el historial de mensajes OCPP de un cargador para diagnostico",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_reporteria}}"
}
```

```json
{
  "name": "Reporteria: Ver uptime de cargadores",
  "description": "Ver estadisticas de disponibilidad y uptime de cargadores del patio",
  "applicationId": "{{app_id}}",
  "permission_group_id": "{{group_reporteria}}"
}
```

---

## Paso 3 — Crear roles

`POST /api/roles`

```json
{
  "name": "wf_operador",
  "description": "Operador del patio — opera cargas y tecles",
  "companyId": "{{company_id}}"
}
```

```json
{
  "name": "wf_supervisor",
  "description": "Supervisor del patio — monitoreo y KPIs",
  "companyId": "{{company_id}}"
}
```

```json
{
  "name": "wf_mantenedor",
  "description": "Mantenedor del patio — datos tecnicos y configuracion OCPP",
  "companyId": "{{company_id}}"
}
```

---

## Paso 4 — Asignar permisos a roles

`POST /api/roles/:roleId/permissions/:permissionId`

No lleva body. Si el API soporta bulk (`POST /api/roles/:roleId/permissions` con array), usar ese en cambio.

### Rol: wf_operador — `{{role_operador}}`

```
POST /api/roles/{{role_operador}}/permissions/{{perm_patio_ver}}
POST /api/roles/{{role_operador}}/permissions/{{perm_cargadores_lista}}
POST /api/roles/{{role_operador}}/permissions/{{perm_cargadores_detalle}}
POST /api/roles/{{role_operador}}/permissions/{{perm_sesiones_historial}}
POST /api/roles/{{role_operador}}/permissions/{{perm_perfil_ver}}
POST /api/roles/{{role_operador}}/permissions/{{perm_op_iniciar}}
POST /api/roles/{{role_operador}}/permissions/{{perm_op_detener}}
POST /api/roles/{{role_operador}}/permissions/{{perm_op_desbloquear}}
POST /api/roles/{{role_operador}}/permissions/{{perm_sesiones_activas}}
POST /api/roles/{{role_operador}}/permissions/{{perm_tecle_ver}}
POST /api/roles/{{role_operador}}/permissions/{{perm_tecle_operar}}
```

### Rol: wf_supervisor — `{{role_supervisor}}`

```
POST /api/roles/{{role_supervisor}}/permissions/{{perm_patio_ver}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_cargadores_lista}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_cargadores_detalle}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_sesiones_historial}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_perfil_ver}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_sup_kpis}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_sup_alertas}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_sup_estado}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_sup_energia}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_rep_sesiones}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_rep_consumo}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_rep_variables_hist}}
POST /api/roles/{{role_supervisor}}/permissions/{{perm_rep_uptime}}
```

### Rol: wf_mantenedor — `{{role_mantenedor}}`

```
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_patio_ver}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_cargadores_lista}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_cargadores_detalle}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_sesiones_historial}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_perfil_ver}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_variables}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_ocpp_msgs}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_ocpp_ver}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_ocpp_editar}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_reset}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_mant_panel}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_rep_variables_hist}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_rep_ocpp_hist}}
POST /api/roles/{{role_mantenedor}}/permissions/{{perm_rep_uptime}}
```

---

## Resumen — permisos por rol

| Permiso | Operador | Supervisor | Mantenedor |
|---|:---:|:---:|:---:|
| Patio: Ver | v | v | v |
| Cargadores: Ver lista | v | v | v |
| Cargadores: Ver detalle | v | v | v |
| Sesiones: Ver historial | v | v | v |
| Perfil: Ver | v | v | v |
| Operaciones: Iniciar carga | v | | |
| Operaciones: Detener carga | v | | |
| Operaciones: Desbloquear conector | v | | |
| Sesiones: Ver activas | v | | |
| Tecle: Ver | v | | |
| Tecle: Operar | v | | |
| Supervision: Ver KPIs operacionales | | v | |
| Supervision: Ver alertas y fallas | | v | |
| Supervision: Ver estado general del patio | | v | |
| Supervision: Ver resumen energetico | | v | |
| Reporteria: Ver sesiones de carga | | v | |
| Reporteria: Ver consumo por sitio | | v | |
| Mantenimiento: Ver variables energeticas | | | v |
| Mantenimiento: Ver mensajes OCPP | | | v |
| Mantenimiento: Ver configuracion OCPP | | | v |
| Mantenimiento: Editar configuracion OCPP | | | v |
| Mantenimiento: Reiniciar cargador | | | v |
| Mantenimiento: Ver panel energetico en tiempo real | | | v |
| Reporteria: Ver variables energeticas historicas | | v | v |
| Reporteria: Ver mensajes OCPP historicos | | | v |
| Reporteria: Ver uptime de cargadores | | v | v |
