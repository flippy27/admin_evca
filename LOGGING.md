# HTTP Logging

Controlado por dos variables en los archivos `.env.*`.

---

## `HTTP_LOG_LEVEL` — qué tan detallado

| Valor | Nombre    | Qué loguea                              |
|-------|-----------|-----------------------------------------|
| `0`   | OFF       | Nada                                    |
| `1`   | BASIC     | URL + status code                       |
| `2`   | DETAILED  | URL + método + status + query params    |
| `3`   | VERBOSE   | Todo lo anterior + request/response body |

---

## `HTTP_LOG_METHODS` — qué métodos loguear

| Valor       | Filtra                                          |
|-------------|-------------------------------------------------|
| `ALL`       | Todos los métodos (default)                     |
| `COMMANDS`  | Solo POST, PUT, PATCH, DELETE (mutaciones)      |
| `GET`       | Solo GETs (polling, lecturas)                   |
| `POST`      | Solo POSTs                                      |
| `POST,DELETE` | Combinación personalizada (comma-separated)   |

---

## `HTTP_LOG_SKIP_PATHS` — silenciar endpoints específicos

Fragmentos de URL a ignorar completamente (comma-separated). Útil para silenciar un endpoint de polling específico sin apagar todo.

```
HTTP_LOG_SKIP_PATHS=charging-session/company,/panel,/group
```

> Los **errores** HTTP nunca se filtran por skip paths — siempre se loguean.

---

## Configuraciones por ambiente

| Ambiente | `HTTP_LOG_LEVEL` | `HTTP_LOG_METHODS` | Resultado                         |
|----------|------------------|--------------------|-----------------------------------|
| dev      | `2`              | `COMMANDS`         | Solo comandos — sin spam de polling |
| qa       | `2`              | `ALL`              | Todo detallado                    |
| stg      | `1`              | `ALL`              | Todo básico                       |
| prod     | `0`              | `ALL`              | Silencioso                        |

---

## Casos de uso comunes

**Silenciar el spam de polling (GETs cada 3s):**
```
HTTP_LOG_LEVEL=2
HTTP_LOG_METHODS=COMMANDS
```

**Ver solo el flujo de inicio de carga:**
```
HTTP_LOG_LEVEL=3
HTTP_LOG_METHODS=POST
```

**Debug completo (todo visible):**
```
HTTP_LOG_LEVEL=3
HTTP_LOG_METHODS=ALL
```

**Apagar completamente:**
```
HTTP_LOG_LEVEL=0
```
> `HTTP_LOG_METHODS` se ignora cuando `HTTP_LOG_LEVEL=0`.

---

## Dónde están los archivos

| Archivo     | Ambiente   |
|-------------|------------|
| `.env.dev`  | Development|
| `.env.qa`   | QA         |
| `.env.stg`  | Staging    |
| `.env.prod` | Production |
