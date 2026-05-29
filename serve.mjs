import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const PORT = Number(process.env.PORT) || 4000;
const ROOT = resolve(process.cwd(), "out");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

async function existeArchivo(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function resolverRuta(pathname) {
  let rel = decodeURIComponent(pathname.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";

  const candidato = normalize(join(ROOT, rel));
  if (candidato !== ROOT && !candidato.startsWith(ROOT + sep)) return null; // anti path-traversal

  if (await existeArchivo(candidato)) return candidato;
  if (!extname(candidato)) {
    const indice = join(candidato, "index.html");
    if (await existeArchivo(indice)) return indice;
    const html = `${candidato}.html`;
    if (await existeArchivo(html)) return html;
  }
  return null;
}

function enviar(res, status, file) {
  res.writeHead(status, { "content-type": TIPOS[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const archivo = await resolverRuta(req.url ?? "/");
  if (archivo) return enviar(res, 200, archivo);

  const noEncontrado = join(ROOT, "404.html");
  if (await existeArchivo(noEncontrado)) return enviar(res, 404, noEncontrado);

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
});

server.listen(PORT, () => {
  console.log(`\n  Control Prenatal — export estático servido en http://localhost:${PORT}\n`);
});
