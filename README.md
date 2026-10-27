# North Trade — sitio web

Sitio de North Trade, inmobiliaria rural de Salta. Hecho con Next.js y TypeScript, se publica en Vercel.

## Verlo en tu computadora

Necesitás tener instalado [Node.js](https://nodejs.org) versión 22 o superior.

```bash
npm install        # solo la primera vez, o cuando cambien las dependencias
npm run dev        # abre el sitio en http://localhost:3000
```

Para cortar el servidor: `Ctrl + C` en la terminal.

## Variables de entorno

Copiá `.env.example` como `.env.local` y completá los valores. El archivo `.env.local` **nunca** se sube al repositorio.

## Comandos útiles

| Comando          | Qué hace                                          |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Sitio en modo desarrollo                          |
| `npm run build`  | Compila el sitio como en producción               |
| `npm run check`  | Revisa tipos, linter, formato y tests, todo junto |
| `npm test`       | Corre los tests                                   |
| `npm run format` | Ordena el formato del código                      |

## Datos pendientes

Los datos que faltan confirmar aparecen en el sitio como `[COMPLETAR: ...]`.
Se cargan en [`src/config/site.ts`](src/config/site.ts).
