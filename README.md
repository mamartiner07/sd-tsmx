# Ausencias - Azure Static Web App (Autenticación Microsoft)

Versión lista para desplegar en **Azure Static Web Apps** con autenticación integrada.

## Estructura
- `public/index.html` → interfaz principal.
- `public/routes.json` → configuración de autenticación y rutas.

## Cómo desplegar
1. Crea un nuevo **Static Web App** en Azure Portal.
2. Conecta tu repositorio GitHub que contenga estos archivos.
3. En "Build Presets" selecciona **Custom**.
4. Configura:
   - App location: `/public`
   - Api location: *(vacío)*
   - Output location: `/public`
5. Guarda y despliega.

La autenticación Microsoft se configurará automáticamente gracias al `routes.json`.
