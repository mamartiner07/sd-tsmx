# Ausencias - Azure Web App (Node/Express)

Este paquete contiene:
- `public/Index.html` (tu archivo original, con una única línea extra para cargar `shim.js`)
- `public/ConfirmacionFinal.html` (tu archivo original, sin cambios en el texto)
- `public/shim.js` (emula `google.script.run` y llama a `/api/*`)
- `server.js` y `package.json` (backend Express listo para Azure)

## Ejecutar localmente
```bash
npm i
npm start
# abre http://localhost:8080
```

## Desplegar en Azure (App Service Linux, Node 18+)
```bash
# crea recursos
az group create -n rg-ausencias -l eastus
az appservice plan create -g rg-ausencias -n plan-ausencias --sku B1 --is-linux
az webapp create -g rg-ausencias -p plan-ausencias -n web-ausencias-demo --runtime "NODE:18LTS"

# despliegue por zip
zip -r app.zip .
az webapp deploy --resource-group rg-ausencias --name web-ausencias-demo --src-path app.zip --type zip
```