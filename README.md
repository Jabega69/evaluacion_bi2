# 🎓 Evaluador de Proyectos

Sistema de gestión y evaluación de proyectos académicos (TFG/TFM).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jabega69/Evaluacion_BI)

## 🚀 Despliegue Rápido

Para desplegar esta aplicación en internet:
1. Haz clic en el botón **"Deploy with Vercel"** de arriba.
2. Inicia sesión con tu cuenta de GitHub.
3. Vercel te pedirá las **Variables de Entorno**. Copia los valores de tu archivo local `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. ¡Listo! Tu aplicación estará online en unos minutos.

## 🌟 Características

- **Panel de Administración**: 
  - Gestión de Usuarios (Tutores, Tribunales, Alumnos)
  - Creación y asignación de Tribunales a Proyectos
  - Calendario de exposiciones

- **Panel de Tutor**:
  - Seguimiento de estudiantes
  - Evaluación continua (Rúbica del Tutor)

- **Panel de Tribunal**:
  - Evaluación de entregas escritas (Rúbrica Memoria)
  - Evaluación de defensa oral (Rúbrica Defensa)

## 🛠 Tecnologías

- **Frontend**: Next.js 14, TailwindCSS
- **Backend / Base de Datos**: Supabase
- **Lenguaje**: TypeScript

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno `.env.local`
4. Ejecutar: `npm run dev`
