# Guía de marca — Iberdrola

> ⚠️ **FUENTE DE VERDAD ACTUAL: el Iberdrola Design System.**
> Los tokens oficiales están vendorizados en [`src/styles/iberdrola-ds/`](./iberdrola-ds/)
> (color, tipografía, spacing/radius/shadow, motion) desde el repo
> `github.com/inakigorostiza/iberdrola-design-system` y se mapean al tema shadcn en
> [`src/index.css`](../index.css).
> **Verde primario oficial: `#00A443`** (green-500) y tipografía **Figtree**.
>
> El contenido de abajo se recogió inicialmente de www.iberdrola.es y queda como
> referencia histórica; ante cualquier discrepancia, **prevalecen los tokens del DS**.

---

## (Histórico) Identidad recogida de www.iberdrola.es

Inspección de estilos computados del sitio (julio 2026).

---

## 1. Paleta de color

### Verdes corporativos (color principal de marca)

| Token | HEX | RGB | HSL | Uso en la web de Iberdrola |
|-------|-----|-----|-----|-----------------------------|
| `green-primary` | `#2F6852` | `47, 104, 82` | `152 38% 30%` | **Color de marca principal.** Enlaces, iconos, bordes, textos destacados, botones |
| `green-dark` | `#00402A` | `0, 64, 42` | `156 100% 13%` | Fondos de secciones oscuras, botones CTA (hover) |
| `green-bright` | `#007F33` | `0, 127, 51` | `144 100% 25%` | Verde de acento brillante (badges, éxito) |
| `green-accent` | `#32AE88` | `50, 174, 136` | `156 55% 44%` | Acento secundario / gráficas |
| `green-light-accent` | `#5BD38C` | `91, 211, 140` | `142 57% 59%` | Acento claro, estados positivos |
| `green-pastel` | `#C8D9D0` | `200, 217, 208` | `152 20% 83%` | Fondos suaves de bloques |
| `green-pastel-2` | `#DCEBE1` | `220, 235, 225` | `140 27% 89%` | Fondos suaves alternativos |
| `green-muted-border` | `#699282` | `105, 146, 130` | `156 16% 49%` | Bordes suaves sobre verde |

### Neutros

| Token | HEX | RGB | Uso |
|-------|-----|-----|-----|
| `white` | `#FFFFFF` | `255,255,255` | Fondo base de la web |
| `off-white` | `#F9F9F9` | `249,249,249` | Fondo de secciones / cards |
| `gray-bg` | `#EFEFEF` | `239,239,239` | Fondos alternos |
| `gray-bg-2` | `#F4F4F4` | `244,244,244` | Fondos alternos |
| `cream` | `#FFFAF6` | `255,250,246` | Fondo cálido de bloques destacados |
| `text-strong` | `#2C2C2C` | `44,44,44` | Texto principal (titulares) |
| `text-body` | `#212529` | `33,37,41` | Texto de cuerpo |
| `text-muted` | `#474747` (80%) | `71,71,71` | Texto secundario |
| `text-gray` | `#707070` | `112,112,112` | Texto terciario / metadatos |
| `border-gray` | `#BFBFBF` | `191,191,191` | Bordes de inputs / separadores |

### Acentos cálidos

| Token | HEX | Uso |
|-------|-----|-----|
| `gold-soft` | `#FFE6A9` | Fondo de avisos / destacados suaves |

### Colores de estado (semánticos, coherentes con marca)

| Estado | Color sugerido | Notas |
|--------|----------------|-------|
| Éxito / Normal | `#007F33` / `#2F6852` | Verde de marca |
| Advertencia | `#FFC107` (amarillo) o `#FD7E14` (naranja) | Bootstrap base del sitio |
| Crítico / Error | `#DC3545` | Rojo |
| Info | `#17A2B8` | Cian |

---

## 2. Tipografía

**Fuente corporativa: `IberPangea`** (familia propia de Iberdrola).

| Familia | Uso | Fallback |
|---------|-----|----------|
| `IberPangea` | Titulares / display | `Lato`, `sans-serif` |
| `IberPangeaText` | Cuerpo de texto | `Lato`, `sans-serif` |
| `Lato` | Fallback de marca (se sirve en su web) | `sans-serif` |

Pesos observados: `Regular (400)`, `Medium`, `SemiBold (SmBold)`, `Bold`, `Black`.

- Tamaño base body: **16px**
- Color de texto por defecto: `#212529`

> ⚠️ **IberPangea es una fuente propietaria** — no está disponible públicamente vía Google Fonts.
> Para el dashboard usamos **Lato** (fallback oficial que la propia web de Iberdrola sirve) como aproximación fiel, o una alternativa geométrica libre similar.
> Cadena recomendada: `"IberPangea", "IberPangeaText", "Lato", system-ui, sans-serif`
> (si se dispone de las licencias de IberPangea, basta con colocar los `.woff2` y ya cargará).

---

## 3. Forma y geometría

| Elemento | Valor | Notas |
|----------|-------|-------|
| Botones (píldora) | `border-radius: 100px` | **Estilo dominante** — botones tipo píldora completa |
| Cards / bloques | `border-radius: 16px` | Esquinas redondeadas generosas |
| Bloques grandes | `border-radius: 40px` | Secciones hero |
| Chips / tags | `border-radius: 20px` | |
| Inputs | `border-radius: 4px` | Bordes suaves |
| Avatares / iconos circulares | `50%` | |

**Botón primario (CTA):** fondo verde oscuro `#00402A` (o `#2F6852`), texto blanco, forma de píldora (`100px`), sin borde, sin transformación de mayúsculas.

---

## 4. Logo

- Wordmark **"Iberdrola"** en verde corporativo `#2F6852` junto a icono de gota/llama (verde + naranja).
- En la cabecera aparece junto al distintivo **"125"** aniversario.
- Fondo de cabecera: gris muy claro (`#EFEFEF` / blanco).

---

## 5. Resumen de tokens (listos para CSS / HSL para shadcn)

```css
/* Iberdrola brand tokens */
--ib-green:            152 38% 30%;   /* #2F6852 principal */
--ib-green-dark:       156 100% 13%;  /* #00402A */
--ib-green-bright:     144 100% 25%;  /* #007F33 */
--ib-green-accent:     156 55% 44%;   /* #32AE88 */
--ib-green-light:      142 57% 59%;   /* #5BD38C */
--ib-green-pastel:     152 20% 83%;   /* #C8D9D0 */
--ib-green-pastel-2:   140 27% 89%;   /* #DCEBE1 */

--ib-white:            0 0% 100%;     /* #FFFFFF */
--ib-off-white:        0 0% 98%;      /* #F9F9F9 */
--ib-gray-bg:          0 0% 94%;      /* #EFEFEF */
--ib-cream:            30 100% 99%;   /* #FFFAF6 */

--ib-text-strong:      0 0% 17%;      /* #2C2C2C */
--ib-text-body:        210 11% 15%;   /* #212529 */
--ib-text-muted:       0 0% 28%;      /* #474747 */
--ib-text-gray:        0 0% 44%;      /* #707070 */
--ib-border:           0 0% 75%;      /* #BFBFBF */

--ib-gold:             41 100% 83%;   /* #FFE6A9 */
--ib-danger:           354 70% 54%;   /* #DC3545 */
--ib-warning:          45 100% 51%;   /* #FFC107 */
--ib-info:             188 78% 41%;   /* #17A2B8 */

--ib-radius-pill:      100px;
--ib-radius-card:      16px;
--ib-radius-input:     4px;

--ib-font-display: "IberPangea", "Lato", system-ui, sans-serif;
--ib-font-body:    "IberPangeaText", "Lato", system-ui, sans-serif;
```
