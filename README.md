# Gateway Prep: sitio de estudio para Kong Konnect Associate

Gateway Prep es un sitio estático independiente para preparar la certificación Kong Konnect Certified Associate. Está publicado en https://kong-konnect-sim-ids.vercel.app.

## Secciones

| Página | Archivo | Contenido |
|---|---|---|
| Simulator | `index.html` | Examen de práctica en inglés: 60 preguntas, 120 minutos, aprobación con 75%, revisión por dominio |
| Study cards | `cards.html` | 65 tarjetas que se recorren deslizando, en inglés y español, con botón Explicar que copia un prompt de estudio |
| Concepts | `concepts.html` | 45 conceptos de Kong con definición, ejemplo y botón Explicar mejor |
| Study plan | `plan.html` | Plan de 13 sesiones, brechas del temario y laboratorio práctico |

## Estructura de archivos

- `bank1.js`, `bank2.js`, `bank3.js`: banco de preguntas del simulador. En el banco la opción correcta siempre es el índice 0; `app.js` mezcla las opciones al mostrarlas.
- `app.js`: lógica del simulador.
- `cards-data.js` (inglés) y `cards-es.js` (español): contenido de las tarjetas, en el mismo orden.
- `concepts-1.js`, `concepts-2.js`, `concepts-3.js`: contenido de los conceptos, cada uno en inglés y español.
- `cards-ai.js`: arma el prompt de estudio y lo copia al portapapeles. Lo usan las tarjetas y los conceptos.
- `brand.css`: colores, tipografía, barra de navegación y pie legal compartidos por todas las páginas.
- `favicon.svg`: ícono de Gateway Prep.

## Marca y uso de Kong

El estilo visual toma la paleta y la tipografía de la guía pública de marca de Kong (verde oscuro `#000F06`, Electric Lime `#CCFF00`, grises Bay, Funnel Sans y Roboto Mono). No usa el logo, el emblema ni los taglines de Kong, y la marca del sitio es Gateway Prep para no sugerir que es un producto oficial. Cada página lleva un aviso de que el sitio no está afiliado, patrocinado ni respaldado por Kong Inc. Si se cambia el diseño, conviene mantener esas tres reglas.

El sitio no tiene build. Cada archivo se sirve tal cual.

## Trabajo local

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Despliegue

Proyecto de Vercel `kong-konnect-sim-ids`, sin framework ni comando de build. Si se conecta este repositorio al proyecto desde Vercel (Settings > Git), cada push a `main` publica en producción.

## Datos del usuario

El progreso se guarda en el `localStorage` de cada navegador, con estos prefijos:

- `kks:` para el simulador.
- `kkc:` para las tarjetas, los conceptos y el idioma.
- `kkp:` para la lista del laboratorio.

No hay backend ni datos compartidos entre personas.
