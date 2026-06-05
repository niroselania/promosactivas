# Promos activas

App web para cargar una planilla Excel, guardar la informacion en el servidor y consultar promociones por sucursal.

## Que hace

- Permite subir una planilla `.xlsx`, `.xls`, `.xlsm` o `.csv`.
- Boton **Suipacha**: muestra todas las filas donde la columna `Sucursal` contenga `Suipacha`.
- Boton **Bariloche**: muestra todas las filas donde la columna `Sucursal` contenga `Bariloche`.
- Si una fila dice `Suipacha/Bariloche`, aparece en ambos botones.
- Boton **Datos utiles**: muestra la informacion de la pestaña `DATOS UTILES`.
- Muestra los nombres reales de las columnas, no letras como Columna A o Columna B.
- Muestra los resultados solo en vista de tabla.
- La columna `DESCRIPCION DE LA PROMO` se muestra mas ancha y ordena los items con check para facilitar la lectura.
- Incluye buscador dentro de los resultados.
- Genera botones de filtro para `Operadora de Tarjeta`.
- Genera botones para `Estado de vigencia`, por ejemplo `ACTIVADA` y `DESACTIVADA`.
- Marca promociones como vigente, por vencer o vencida cuando detecta una columna de fecha/vigencia.
- Permite descargar el resultado filtrado en Excel.
- Recuerda la ultima opcion usada al cargar una nueva planilla.
- Guarda la ultima planilla cargada en el servidor, para que otros equipos puedan verla sin subirla otra vez.

## Ejecutar con Docker

```bash
docker build -t promos-activas .
docker run -d --name promos-activas -p 6700:80 -v promos-activas-data:/app/data promos-activas
```

Abrir:

```text
http://localhost:6700
```

## Usar en Portainer

1. Subir este proyecto a GitHub.
2. En Portainer, ir a **Stacks**.
3. Crear un stack nuevo.
4. Elegir **Repository**.
5. Pegar la URL del repositorio de GitHub.
6. Usar `docker-compose.yml`.
7. Deploy.

La app queda publicada en el puerto `6700` del servidor, salvo que cambies el puerto en `docker-compose.yml`.

El stack usa un volumen llamado `promos_activas_data`. Ahi se guarda la ultima planilla procesada para que cualquier ordenador que abra la app vea los datos sin volver a subir el archivo.

Importante: la planilla solo queda compartida si se carga desde la URL del servidor, por ejemplo `http://TU_SERVIDOR:6700`. Si se abre el archivo `index.html` suelto en una computadora, no puede guardar datos para otros equipos.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Crear app de promos activas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

Reemplazar `TU_USUARIO/TU_REPOSITORIO` por el repositorio real.
