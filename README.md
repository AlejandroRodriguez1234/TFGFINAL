# 🏋️ FitForge — Forja tu mejor versión

> Plataforma fitness de última generación con IA, diseño moderno y arquitectura de microservicios.
> Desarrollada como Trabajo de Fin de Grado (TFG).

---

## 🏗️ Arquitectura

```
┌───────────────────────────────────────────────────────────────┐
│                        NGINX (Reverse Proxy)                 │
│              Rate limiting · SSL · Load balancing            │
└────┬──────┬───────┬───────┬──────────────────────┘
     │          │           │           │
     ▼          ▼           ▼           ▼
 Frontend   Auth Svc    API Svc    Diet Svc    AI Svc
 React 18   Java 21    Node.js    Laravel     Python
 Vite+GSAP  Spring     NestJS     PHP 8.3     FastAPI
 Tailwind   Boot 3     Prisma     +MySQL      MediaPipe
            JWT+2FA    Socket.io  +OpenFoodF
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                PostgreSQL        Redis
                (principal)    (caché/sesiones)
```

## 🚀 Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| **Frontend** | React 18 + TypeScript + Vite | SPA con lazy loading |
| | Tailwind CSS + GSAP + Framer Motion | Animaciones avanzadas |
| | Three.js + React Three Fiber | 3D en landing page |
| | Zustand + React Query | Estado global y caché |
| | i18next | Internacionalización ES/EN |
| | PWA (Vite Plugin) | Instalable como app nativa |
| **Auth** | Java 21 + Spring Boot 3 | Microservicio de autenticación |
| | JWT + TOTP (2FA) | Seguridad avanzada |
| | Flyway | Migraciones de BD |
| **API Principal** | Node.js + NestJS | API REST principal |
| | Prisma ORM | ORM type-safe |
| | Socket.io | Notificaciones en tiempo real |
| | Swagger | Documentación automática |
| **Nutrición** | Laravel 11 + PHP 8.3 | Microservicio de dietas |
| | Open Food Facts API | 500K+ alimentos por código de barras |
| | Cálculo BMR/TDEE | Generador de planes IA |
| **IA** | Python 3.12 + FastAPI | Microservicio de inteligencia artificial |
| | MediaPipe | Análisis de postura |
| | Cálculos composición corporal | IMC, % grasa, macros |
| **Infra** | Docker + Docker Compose | Containerización completa |
| | Nginx | Reverse proxy + rate limiting |
| | PostgreSQL 16 | Base de datos principal |
| | Redis 7 | Caché y sesiones |

## 📦 Módulos de la Aplicación

### 🔐 Autenticación
- Registro en 2 pasos con validación de contraseña robusta
- Login con JWT (access + refresh tokens)
- 2FA con TOTP (Google Authenticator / Authy)
- Recuperación de contraseña por email

### 🏠 Dashboard
- Resumen diario: calorías, agua, sueño, ejercicios
- Anillos de actividad estilo Apple Watch
- Gráfica semanal de calorías
- Sistema de nivel/XP y racha

### 🎯 Hábitos
- Creación y seguimiento de hábitos personalizados
- Vista semanal de cumplimiento
- Rachas y tasa de cumplimiento
- Animaciones de check/uncheck

### 💪 Gimnasio
- +200 ejercicios con músculos trabajados
- Rutinas por plantilla con series/reps/peso
- Modo entrenamiento con temporizador de descanso
- Historial de entrenamientos y progresión

### 🥗 Nutrición
- Registro de comidas por tipo (desayuno, comida, cena, snack)
- Búsqueda en BD de 500K+ alimentos (Open Food Facts)
- **Escaneo de código de barras** para identificar alimentos
- Seguimiento de macros y micronutrientes
- Tracker de hidratación
- **Chatbot nutricional** con respuestas frecuentes
- **Generador de planes de dieta con IA** (cálculo BMR/TDEE + objetivos)

### 📈 Progreso
- Evolución de peso y composición corporal
- Gráficas de fuerza y records personales
- **Análisis de postura con IA** (MediaPipe)
- Sistema de logros y badges

### 👥 Social
- Feed de actividad de amigos
- Sistema de amigos/solicitudes
- Retos entre usuarios
- Tabla de clasificación global

### ⚙️ Ajustes
- Gestión de perfil
- Cambio de contraseña
- Configuración 2FA
- Preferencias de notificaciones
- Selector de idioma (ES/EN)

### 🛡️ Panel de Administración
- Dashboard con KPIs globales
- Gestión de usuarios (CRUD + roles)
- Distribución por roles (Admin/Trainer/Client)
- Estado de servicios en tiempo real

## 🐳 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/alejandrorodriguez1234/tfg.git
cd tfg

# Copiar variables de entorno
cp .env.example .env

# Iniciar todos los servicios
make up

# O en modo desarrollo (con hot-reload)
make dev
```

Accede a:
- **App**: http://localhost
- **API Docs**: http://localhost/api/docs
- **AI Docs**: http://localhost/ai/docs
- **Admin**: http://localhost/admin (user: admin@fitforge.app / pass: admin123)

## 🧪 Tests

```bash
make test        # Todos los tests
make lint        # Linters
```

## 📁 Estructura del Proyecto

```
fitforge/
├── frontend/              # React + TypeScript + Vite
├── services/
│   ├── auth-service/      # Java Spring Boot
│   ├── api-service/       # Node.js NestJS
│   ├── diet-service/      # Laravel PHP
│   └── ai-service/        # Python FastAPI
├── infrastructure/
│   ├── nginx/             # Reverse proxy config
│   └── postgres/          # DB init scripts
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
└── .env.example
```

## 👨‍💻 Roles de Usuario

| Rol | Acceso |
|-----|-------|
| **CLIENT** | Todas las funcionalidades de fitness |
| **TRAINER** | Gestión de planes y clientes |
| **ADMIN** | Panel de administración completo |

---

## 🔑 Credenciales de Acceso (Demo)

| Rol | Email | Contraseña |
|-----|-------|----------|
| **Admin** | admin@fitforge.app | admin123 |
| **Trainer** | trainer@fitforge.app | trainer123 |
| **Cliente** | demo@fitforge.app | demo123 |

## 👤 Funcionalidades por Rol

### 🏃 Cliente (demo@fitforge.app)
- **Dashboard**: resumen diario con calorías, agua, sueño y ejercicios; anillos de actividad; racha y XP
- **Hábitos**: crear/eliminar hábitos, marcar como completado, ver racha semanal y tasa de cumplimiento
- **Gimnasio**: navegar rutinas por músculo y dificultad, iniciar entrenamiento rápido o por plantilla, registrar series/reps/peso con temporizador de descanso
- **Nutrición**: registrar comidas por tipo (desayuno, comida, cena, snack), búsqueda de alimentos, tracker de agua, análisis de foto de comida con IA
- **Planificador de dieta**: generador automático de plan semanal con cálculo BMR/TDEE
- **Progreso**: evolución de peso y composición corporal, récords personales, calculadora nutricional, logros y badges
- **Social**: feed de actividad, sistema de amigos, retos y tabla de clasificación
- **Perfil**: editar datos personales, estadísticas fitness, historial de logros
- **Ajustes**: cambio de contraseña, configuración 2FA, preferencias de notificaciones, selector ES/EN
- **Asistente IA**: chatbot contextual con datos del día (calorías, agua, hábitos, entrenamiento)

### 💼 Entrenador (trainer@fitforge.app)
- Acceso a todo lo del rol Cliente, más:
- **Panel de Entrenador**: estadísticas globales (clientes activos, sesiones del día, tasa de retención, ingresos)
- **Gestión de clientes**: lista de clientes con búsqueda, estado de racha y último entreno
- **Mensajería directa**: enviar mensajes personalizados a clientes desde el panel
- **Planes de entrenamiento**: vista y gestión de plantillas asignadas a clientes
- **Sesiones del día**: agenda de sesiones con estado (completada/programada)

### 🛡️ Administrador (admin@fitforge.app)
- Acceso a todo lo del rol Entrenador, más:
- **Panel de Administración**: KPIs globales (usuarios totales, activos hoy, nuevos esta semana, entrenamientos)
- **Gráficas**: nuevos registros por mes, distribución de usuarios por rol
- **Gestión de usuarios**: lista completa con roles (Admin/Trainer/Client), fecha de registro, acciones por usuario
- **Estado de servicios**: monitorización en tiempo real de Auth, API, Diet y AI services
- **Acceso a `/admin/users`**: CRUD completo de usuarios con filtrado y cambio de rol
