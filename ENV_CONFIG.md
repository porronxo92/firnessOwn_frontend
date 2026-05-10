# 🔐 Configuración de Variables de Entorno

## Netlify

### Opción 1: Con script dinámico (set-env.js) ✅ Configurado

El proyecto ya incluye `set-env.js` que lee variables de entorno durante el build.

**Pasos:**

1. **Ir a tu proyecto en Netlify** → Site settings → Environment variables

2. **Agregar esta variable:**
   ```
   Variable: API_URL
   Value: https://tu-backend.railway.app/api
   ```
   ⚠️ **Sin comillas**, solo la URL completa

3. **Desplegar:**
   - Netlify detecta cambios en `main` y redespliega automáticamente
   - El script `set-env.js` se ejecuta antes del build
   - Lee `API_URL` y genera `environment.prod.ts` con la URL correcta

**Verificación:**
- En los logs de build de Netlify deberías ver:
  ```
  ✅ environment.prod.ts configurado con API_URL: https://tu-backend...
  ```

### Opción 2: Hardcodear URL (Más simple)

Si prefieres no usar variables de entorno dinámicas:

1. **Editar manualmente** `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://tu-backend.railway.app/api'
   };
   ```

2. **Commit y push:**
   ```bash
   git add src/environments/environment.prod.ts
   git commit -m "Update: Production API URL"
   git push origin main
   ```

3. **No necesitas configurar** `API_URL` en Netlify

---

## Vercel

### Con script dinámico (set-env.js) ✅ Configurado

**Pasos:**

1. **Dashboard de Vercel** → Tu proyecto → Settings → Environment Variables

2. **Agregar variable:**
   ```
   Name: API_URL
   Value: https://tu-backend.railway.app/api
   Environment: Production
   ```

3. **Redeploy:**
   - Vercel detecta cambios automáticamente
   - O forzar redeploy desde Dashboard → Deployments → Redeploy

**Nota:** Vercel ejecuta `npm run build:prod` que incluye `node set-env.js`

---

## Cómo funciona set-env.js

```javascript
// Lee la variable de entorno API_URL
const apiUrl = process.env.API_URL || 'http://localhost:8000/api';

// Escribe environment.prod.ts con la URL correcta
const envContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};`;

fs.writeFileSync('./src/environments/environment.prod.ts', envContent);
```

**Flujo:**
1. Netlify/Vercel ejecuta `npm run build:prod`
2. Ejecuta `node set-env.js` (lee `API_URL` del environment)
3. Genera `environment.prod.ts` con la URL correcta
4. Angular buildea con esa configuración
5. La app en el navegador usa la URL configurada

---

## Troubleshooting

### Error: "Cannot find module" al ejecutar set-env.js

**Solución:**
```bash
npm install
```

El script usa Node.js nativo (`fs`), no requiere dependencias adicionales.

### La app usa localhost en producción

**Causa:** La variable `API_URL` no está configurada en Netlify/Vercel.

**Solución:**
1. Verificar que `API_URL` esté en Environment Variables
2. Verificar que el valor NO tenga comillas
3. Redeploy forzado

### Error de CORS en producción

**Causa:** El backend no permite el dominio del frontend.

**Solución en el backend (app/main.py):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-frontend.vercel.app",
        "https://tu-frontend.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Recomendación

Para un proyecto personal:
- ✅ **Usa Opción 1 (set-env.js)** si vas a cambiar la URL del backend frecuentemente
- ✅ **Usa Opción 2 (hardcodear)** si la URL es estable y quieres simplicidad

Ambas opciones funcionan perfectamente en producción.

---

**Última actualización:** Mayo 2026
