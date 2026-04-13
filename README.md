# CuotApp Escolar

Plataforma de gobernanza financiera para cursos escolares en Chile. Permite a apoderados, alumnos y directivas gestionar cuotas, eventos, votaciones y pagos de forma transparente y democr&aacute;tica.

> [!NOTE]
> Este proyecto est&aacute; en desarrollo activo (v0.1.0). Algunas funcionalidades pueden cambiar.

---

## Caracter&iacute;sticas

### Gesti&oacute;n financiera
- **Centro de Pago** &mdash; Registro de pagos con comprobante, validaci&oacute;n en dos etapas (aprobaci&oacute;n + validaci&oacute;n)
- **Boletas** &mdash; Historial de comprobantes con estado y enlace a respaldo
- **Billeteras** &mdash; Doble billetera (apoderados + alumnos) por curso
- **Cuotas** &mdash; Seguimiento individual por apoderado con monto calculado autom&aacute;ticamente

### Votaciones democr&aacute;ticas
- **Doble vuelta** &mdash; Primera vuelta con qu&oacute;rum (&#8968;N/2&#8969; + 1), segunda vuelta sin m&iacute;nimo (48h)
- **Auto-trigger** &mdash; Si la primera vuelta expira sin qu&oacute;rum, se crea la segunda autom&aacute;ticamente
- **Veto** &mdash; El Profesor Jefe puede vetar votaciones aprobadas con justificaci&oacute;n
- **Destino de sobrante** &mdash; Votaci&oacute;n autom&aacute;tica al cerrar eventos con excedente (fondo reserva vs. saldo a favor)

### Gobernanza
- **Modo En Marcha** &mdash; Los primeros 30 d&iacute;as, solo el fundador puede proponer eventos
- **Regla del 70%** &mdash; Identidad de deudores protegida hasta que transcurre el 70% del plazo de pago
- **Cierre anual** &mdash; Resumen financiero con exportaci&oacute;n PDF y desactivaci&oacute;n del curso

### Roles y permisos

| Rol | Proponer eventos | Aprobar pagos | Aprobar perfiles | Vetar | Cierre anual |
|-----|:---:|:---:|:---:|:---:|:---:|
| Fundador | &#10003; | &#10003; | &#10003; | &mdash; | &#10003; |
| Presidente | &#10003; | &#10003; | &#10003; | &mdash; | &#10003; |
| Tesorero | &#10003; | &#10003; | &mdash; | &mdash; | &mdash; |
| Profesor Jefe | &#10003; | &#10003; | &#10003; | &#10003; | &#10003; |
| Secretario | &mdash; | &mdash; | &mdash; | &mdash; | &mdash; |
| Apoderado | &mdash; | &mdash; | &mdash; | &mdash; | &mdash; |
| Alumno | &mdash; | &mdash; | &mdash; | &mdash; | &mdash; |

---

## Stack

| Capa | Tecnolog&iacute;a |
|------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| UI | [Tailwind CSS v4](https://tailwindcss.com/) + [MUI v7](https://mui.com/) + [Lucide](https://lucide.dev/) |
| Backend | [Supabase](https://supabase.com/) (Auth, PostgreSQL, Row Level Security) |
| Lenguaje | TypeScript 5.8 |
| Runtime | React 19, Server Components + Server Actions |

---

## Requisitos previos

- **Node.js** &ge; 18
- **npm** &ge; 9
- Proyecto en [Supabase](https://supabase.com/) con las tablas y pol&iacute;ticas RLS configuradas

---

## Instalaci&oacute;n

```bash
git clone https://github.com/Tenka-Solutions/CuotApp-Escolar.git
cd CuotApp-Escolar
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la ra&iacute;z del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> [!IMPORTANT]
> Nunca compartas `SUPABASE_SERVICE_ROLE_KEY` en el frontend. Esta clave solo se usa en Server Actions y middleware.

### Ejecutar en desarrollo

```bash
npm run dev
```

La app estar&aacute; disponible en `http://localhost:3000`.

> [!TIP]
> En modo desarrollo, el login viene pre-llenado con las credenciales root (`admin@cuotapp.local` / `admin`). Este usuario puede navegar todos los m&oacute;dulos en modo lectura.

---

## Scripts disponibles

| Comando | Descripci&oacute;n |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producci&oacute;n |
| `npm run start` | Servidor de producci&oacute;n |
| `npm run lint` | Linter (ESLint) |
| `npm run typecheck` | Verificaci&oacute;n de tipos (TypeScript) |

---

## Estructura del proyecto

```
app/
  (auth)/                   # Flujo de autenticaci&oacute;n
    login/                  # Inicio de sesi&oacute;n
    registro/               # Registro con c&oacute;digo de invitaci&oacute;n
    recuperar/              # Recuperaci&oacute;n de contrase&ntilde;a
    nueva-contrasena/       # Restablecimiento de contrase&ntilde;a
  (dashboard)/              # Aplicaci&oacute;n principal (requiere sesi&oacute;n)
    page.tsx                # Dashboard con balance, eventos, calendario
    pagar/                  # Centro de pago + deudores
    boletas/                # Historial de comprobantes
    votaciones/             # Votaciones abiertas + veto
    perfil/                 # Perfil del usuario
    eventos/
      nuevo/                # Proponer nuevo evento
    admin/
      aprobaciones/         # Aprobar perfiles pendientes
      transacciones/        # Validar transacciones
      cierre-anual/         # Resumen financiero + cierre
    components/             # Componentes compartidos del dashboard
lib/
  constants.ts              # Roles, estados, reglas de negocio
  utils.ts                  # RUT, moneda, l&oacute;gica de negocio
  types/                    # Tipos TypeScript (auto-generados + manuales)
  supabase/                 # Clientes Supabase (server, client, middleware)
middleware.ts               # Guard de autenticaci&oacute;n + estado de perfil
```

---

## Reglas de negocio

| Regla | Valor | Descripci&oacute;n |
|-------|-------|-------------|
| Modo En Marcha | 30 d&iacute;as | Per&iacute;odo inicial donde solo el fundador propone eventos |
| Umbral deudores | 70% | Porcentaje del plazo para revelar identidad de deudores |
| Auto-validaci&oacute;n | 7 d&iacute;as | Plazo para que el Profesor Jefe valide antes de auto-aprobaci&oacute;n |
| 1&ordf; vuelta | 24 horas | Duraci&oacute;n con qu&oacute;rum requerido (&#8968;N/2&#8969; + 1) |
| 2&ordf; vuelta | 48 horas | Duraci&oacute;n sin qu&oacute;rum m&iacute;nimo |
| L&iacute;mite de propuestas | 1/d&iacute;a | M&aacute;ximo de eventos propuestos por usuario por d&iacute;a |

> [!WARNING]
> Las reglas de negocio est&aacute;n definidas en `lib/constants.ts` bajo el objeto `REGLAS`. Modificarlas afecta el comportamiento de toda la plataforma.

---

## Flujo de autenticaci&oacute;n

```
Usuario no autenticado
  &rarr; /login (o /registro con c&oacute;digo de invitaci&oacute;n)
  &rarr; Supabase Auth (email + password)
  &rarr; Middleware verifica sesi&oacute;n + estado del perfil
    &rarr; pendiente    &rarr; /pendiente-aprobacion
    &rarr; rechazado    &rarr; /acceso-denegado
    &rarr; suspendido   &rarr; /acceso-denegado
    &rarr; activo       &rarr; Dashboard
```

---

## Licencia

Proyecto privado &mdash; &copy; 2026 Tenka Solutions. Todos los derechos reservados.
