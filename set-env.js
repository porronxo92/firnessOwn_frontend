// Script para inyectar variables de entorno en tiempo de build
const fs = require('fs');

// Leer la variable de entorno API_URL de Netlify/Vercel
const apiUrl = process.env.API_URL || 'http://localhost:8000/api';

// Contenido del archivo environment.prod.ts
const envContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

// Escribir el archivo
fs.writeFileSync('./src/environments/environment.prod.ts', envContent);

console.log('✅ environment.prod.ts configurado con API_URL:', apiUrl);
