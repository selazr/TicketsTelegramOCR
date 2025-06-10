# Tickets Telegram OCR

Bot de Telegram para registrar tickets de compra utilizando OCR y GPT-4o.

Desde la imagen se detecta automáticamente la moneda del ticket para convertir el importe a euros si es necesario. Además se mejoró el preprocesado de la imagen para aumentar la precisión en tickets con poca calidad.

## Instalación

1. Clona el repositorio y entra en la carpeta.
2. Copia `env.example` a `.env` y rellena las variables necesarias.
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el bot:
   ```bash
   npm start
   ```

## Variables de entorno

Revisa el archivo `env.example` para conocer todas las variables requeridas para la ejecución.

## Pruebas

Se utilizan pruebas unitarias con Jest. Para ejecutarlas:

```bash
npm test
```
