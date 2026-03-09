# Guía Rápida para el Equipo Backend

Bienvenido a las entrañas del sistema. En esta carpeta residirá toda la lógica de Express, LangChain y la orquestación asíncrona de BullMQ.

## Requisitos Previos

- Docker y Docker Compose instalados.
- Node.js local.

## Cómo levantar la infraestructura local

### 1. Variables y Secretos

cp .env.example .env

### 2. Levantar los Servicios

docker-compose up backend --build

### 3. Verificar que levanta ok

Abre tu navegador y haz un ping a:
- http://localhost:4000/health

## Modificar Dependencias Node

1. Baja primero el entorno que tienes levantado:
   docker-compose down
2. Instala como solías hacer en local:
   cd apps/backend
   npm install tu-nueva-dependencia
3. Sube y reconstruye de nuevo desde la raíz:
   cd ../../
   docker-compose up backend --build

## Arquitectura de Workers (BullMQ)

- Recoges la petición en un endpoint de Express.
- Añades ese job.
- Y el código pesado lo procesas de forma desatendida en la instancia new Worker.

## Merge a Main y Testing Automático

El código está protegido. Todo Pull Request hacia main se enviará a una Action de Github.
