# Outbounding Automation - Guía de Git y Workflows

Este documento establece las reglas del juego para todo el equipo (Frontend y Backend). Para mantener el repositorio limpio, organizado y evitar conflictos dolorosos, seguiremos este estándar de ramas y Pull Requests.

## 🌳 Arquitectura de Ramas

Tenemos las siguientes ramas principales protegidas:
- `main`: Es la rama de **Producción**. El código aquí siempre debe funcionar. Las fusiones a `main` requieren aprobación previa mediante Pull Request (PR) y que el pipeline de Docker CI pase en verde.
- `staging`: Rama de **Pre-producción**. Aquí probamos las integraciones de front y back antes de salir a `main`.
- `development`: La rama base de **Integración Continua** del día a día.

### Ramas de Trabajo (Features / Fixes)
Nunca (¡NUNCA!) hagas commits directamente a `main`, `staging` o `development`. 
Cada nueva tarea, mejora o arreglo debe tener su propia rama, creada SIEMPRE desde la rama `development`.

**Nomenclatura Obligatoria:**
- Equipo Frontend: `feat/front-nombre-de-tarea` o `fix/front-nombre-de-error`
- Equipo Backend: `feat/back-nombre-de-tarea` o `fix/back-nombre-de-error`

Ejemplo:
```bash
# Asegúrate de estar en development actualizado
git checkout development
git pull origin development

# Crea tu propia rama y muévete a ella
git checkout -b feat/front-login-ui
```

## 🔄 Cómo integrar tu código (Pull Requests)

Una vez terminas tu tarea en tu rama `feat/front-login-ui`:
1. Haz tus commits: `git commit -m "feat(front): añado pantalla de login"`
2. Sube tu rama al servidor remoto: `git push -u origin feat/front-login-ui`
3. Ve a GitHub y abre un **Pull Request (PR)** apuntando hacia `development`.

> **Importante:** Tu código pasará por un bot (GitHub Actions). Si rompiste alguna dependencia o el linter llora, tu PR será bloqueado hasta que lo arregles.

## ⚔️ Cómo resolver Conflictos de Merge

Si tú y otro compañero tocaron el mismo archivo (por ejemplo el `package.json` o un componente común), GitHub te dirá que hay conflictos y no te dejará hacer merge del PR. **No entres en pánico, no pasa nada**.

Para solucionarlo:

1. Baja los últimos cambios de `development` a tu ordenador:
   ```bash
   git checkout development
   git pull origin development
   ```
2. Vuelve a la rama en la que estás trabajando:
   ```bash
   git checkout tu-rama-con-conflicto
   ```
3. "Fusila" (mergea) development dentro de tu rama:
   ```bash
   git merge development
   ```
4. Git te avisará de que hay conflictos. Abre Visual Studio Code, ve al sistema de control de versiones y verás los archivos en rojo. Ábrelos, decide si te quedas con tu código (Current Change), el de tu compañero (Incoming Change) o una mezcla de ambos.
5. Cuando los hayas limpiado todos, guarda y haz el commit final del merge:
   ```bash
   git add .
   git commit -m "chore: reso conflictos con development"
   git push
   ```
¡Y listo! Tu Pull Request brillará en verde otra vez.
