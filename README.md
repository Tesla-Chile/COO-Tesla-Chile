# Tesla Chile TCO

App web estática basada en las tres primeras páginas del Power BI:

- Energía
- Mantención
- Total

La app compara costo mensual de un vehículo a combustión versus Tesla usando supuestos editables: kilometraje anual, rendimiento, tipo de combustible, precio kWh, mantenciones, permiso de circulación y seguro.

## Como verla

Abre `index.html` en el navegador.

## Como publicarla en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos archivos al repositorio.
3. En GitHub, entra a `Settings > Pages`.
4. En `Build and deployment`, elige `Deploy from a branch`.
5. Selecciona la rama principal y la carpeta raíz.

## Archivos principales

- `index.html`: estructura de la app.
- `styles.css`: diseño responsive.
- `app.js`: cálculos y comportamiento interactivo.
- `assets/`: logos usados en la interfaz.
- `Cost of Ownership Tesla Chile.pbix`: archivo original usado como contexto.
