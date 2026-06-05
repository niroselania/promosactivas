const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 80);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "promos-data.json");
const MAX_BODY_BYTES = 25 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

fs.mkdirSync(DATA_DIR, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/data" && req.method === "GET") {
      return sendSavedData(res);
    }

    if (req.url === "/api/data" && req.method === "POST") {
      return saveData(req, res);
    }

    if (req.method === "GET" || req.method === "HEAD") {
      return serveStatic(req, res);
    }

    sendJson(res, 405, { error: "Metodo no permitido" });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Error interno del servidor" });
  }
});

server.listen(PORT, () => {
  console.log(`Promos activas escuchando en puerto ${PORT}`);
});

function sendSavedData(res) {
  if (!fs.existsSync(DATA_FILE)) {
    return sendJson(res, 200, { exists: false });
  }

  const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  sendJson(res, 200, { exists: true, data: saved });
}

function saveData(req, res) {
  let size = 0;
  const chunks = [];

  req.on("data", (chunk) => {
    size += chunk.length;

    if (size > MAX_BODY_BYTES) {
      res.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "La planilla es demasiado grande para guardar." }));
      req.destroy();
      return;
    }

    chunks.push(chunk);
  });

  req.on("end", () => {
    try {
      const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      validatePayload(payload);
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
      sendJson(res, 200, { ok: true, savedAt: payload.savedAt });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "No se pudieron guardar los datos." });
    }
  });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Datos invalidos.");
  }

  if (!payload.activeData || !Array.isArray(payload.activeData.headers) || !Array.isArray(payload.activeData.records)) {
    throw new Error("Faltan los datos principales de promociones.");
  }

  if (!payload.usefulData || !Array.isArray(payload.usefulData.headers) || !Array.isArray(payload.usefulData.records)) {
    throw new Error("Faltan los datos utiles.");
  }
}

function serveStatic(req, res) {
  const rawPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  const requestedPath = rawPath === "/" ? "/index.html" : rawPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendJson(res, 403, { error: "Ruta no permitida" });
  }

  const finalPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(PUBLIC_DIR, "index.html");
  const ext = path.extname(finalPath).toLowerCase();
  const type = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(finalPath).pipe(res);
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}
