// server.js - Versión limpia sin Google, con autenticación Microsoft Entra ID
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- "DB" temporal en memoria ---
const db = {
  requests: [],
  occupiedVacRanges: [{ start: "2025-11-10", end: "2025-11-12" }],
  feedback: []
};
let seq = 1;
const nowIso = () => new Date().toISOString().slice(0,16).replace("T"," ");

// ✅ NUEVO: obtener usuario autenticado desde Microsoft Entra ID
app.get("/api/session", (req, res) => {
  try {
    const principal = req.headers["x-ms-client-principal"];
    if (principal) {
      const decoded = JSON.parse(Buffer.from(principal, "base64").toString("ascii"));
      const user = decoded.userDetails || "usuario@empresa.com";
      const name = decoded.name || user.split("@")[0];
      return res.json({ email: user, displayName: name });
    } else {
      // Usuario no autenticado (p. ej. Entra ID desactivado)
      return res.json({ email: null, displayName: null });
    }
  } catch (err) {
    console.error("Error leyendo identidad:", err);
    res.status(500).json({ error: "No se pudo leer la identidad." });
  }
});

// ---- Endpoints API ----

// Vacaciones ocupadas
app.get("/api/vacations/occupied", (req, res) => {
  res.json(db.occupiedVacRanges);
});

// Enviar solicitud de vacaciones
app.post("/api/vacations", (req, res) => {
  const { startDate, endDate, solicitanteEmail, solicitanteNombre } = req.body || {};
  const id = `${Date.now()}-${seq++}`;
  const fila = String(db.requests.length + 1).padStart(4, "0");
  const item = {
    id, fila, tipo: "vacaciones", estado: "pendiente", timestamp: nowIso(),
    email: solicitanteEmail,
    meta: { startDate, endDate },
    steps: [
      { label: "Enviado", status: "approved", at: nowIso() },
      { label: "Decisión TL", status: "pending", at: "" }
    ]
  };
  db.requests.push(item);
  res.json({ ok: true, tipo: item.tipo, fila });
});

// Cambio de horario
app.post("/api/shifts", (req, res) => {
  const { peerEmail, yourSchedule, peerSchedule, solicitanteEmail } = req.body || {};
  const id = `${Date.now()}-${seq++}`;
  const fila = String(db.requests.length + 1).padStart(4, "0");
  const item = {
    id, fila, tipo: "cambio_horario", estado: "pendiente (N1)", timestamp: nowIso(),
    email: solicitanteEmail,
    meta: { peerEmail, yourSchedule, peerSchedule },
    steps: [
      { label: "Enviado", status: "approved", at: nowIso() },
      { label: "Compañero (N1)", status: "pending", at: "" },
      { label: "Team Leader (N2)", status: "pending", at: "" }
    ]
  };
  db.requests.push(item);
  res.json({ ok: true, tipo: item.tipo, fila });
});

// Retardos
app.post("/api/tardiness", (req, res) => {
  const { reason, lateDate, expectedTime, actualTime, solicitanteEmail } = req.body || {};
  const id = `${Date.now()}-${seq++}`;
  const fila = String(db.requests.length + 1).padStart(4, "0");
  const item = {
    id, fila, tipo: "retardo", estado: "pendiente", timestamp: nowIso(),
    email: solicitanteEmail,
    meta: { reason, lateDate, expectedTime, actualTime },
    steps: [
      { label: "Enviado", status: "approved", at: nowIso() },
      { label: "Decisión TL", status: "pending", at: "" }
    ]
  };
  db.requests.push(item);
  res.json({ ok: true, tipo: item.tipo, fila });
});

// Listar solicitudes
app.get("/api/requests", (req, res) => {
  const email = req.query.email || "";
  const list = db.requests
    .filter(r => !email || r.email === email)
    .sort((a,b) => b.id.localeCompare(a.id));
  res.json(list);
});

// Guardar feedback
app.post("/api/feedback", (req, res) => {
  const { email, rating, comments, tipo, fila } = req.body || {};
  db.feedback.push({ at: nowIso(), email, rating, comments, tipo, fila });
  res.json({ ok: true });
});

// Servir el frontend
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Lanzar servidor
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Servidor escuchando en puerto ${port}`));
