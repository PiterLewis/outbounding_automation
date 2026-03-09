# Guía Rápida para el Equipo Frontend

Bienvenido al equipo de Frontend. Aquí tienes todo lo que necesitas para levantar tu entorno de Next.js y colaborar.

## Requisitos Previos

- Docker y Docker Compose instalados.
- Node.js instalado localmente.

## Cómo levantar el entorno de trabajo

### 1. Variables de Entorno

cp .env.example .env

### 2. Levantar el Frontend

docker-compose up frontend --build

Con este comando:
1. Docker instalará todo.
2. Automáticamente levantará el Backend y Redis.

### 3. Empieza a programar

- Tu aplicación Next.js estará corriendo en: http://localhost:3000
- La API de Backend de tus compañeros estará en: http://localhost:4000

## Añadir Nuevas Librerías al Proyecto

1. Pausa el contenedor.
2. Ve a la carpeta local de frontend e instálalo:
   cd apps/frontend
   npm install framer-motion
3. Regresa a la raíz de tu proyecto y vuelve a levantar el servicio docker:
   cd ../../
   docker-compose up frontend --build

## Reglas y CI/CD (Pipeline)

- Asegúrate de ejecutar npm run lint.
- La rama main de este proyecto está bloqueada.
