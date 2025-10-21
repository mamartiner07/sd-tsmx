
// server.js - Backend Express para Azure Web App (Node 18+)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// "DB" en memoria para demo
const db = {
  requests: [],
  occupiedVacRanges: [{ start: "2025-11-10", end: "2025-11-12" }],
  feedback: []
};
let seq = 1;
const nowIso = () => new Date().toISOString().slice(0,16).replace("T", " ");

// API
app.get("/api/session", (req, res) => {
  res.json({ email: "usuario@empresa.com", displayName: "Usuario Demo" });
});

app.get("/api/vacations/occupied", (req, res) => {
  res.json(db.occupiedVacRanges);
});

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

app.post("/api/shifts", (req, res) => {
  const { peerEmail, yourSchedule, peerSchedule, solicitanteEmail, solicitanteNombre } = req.body || {};
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

app.get("/api/requests", (req, res) => {
  const email = req.query.email || "";
  const list = db.requests
    .filter(r => !email || r.email === email)
    .sort((a,b) => b.id.localeCompare(a.id));
  res.json(list);
});

app.post("/api/feedback", (req, res) => {
  const { email, rating, comments, tipo, fila } = req.body || {};
  db.feedback.push({ at: nowIso(), email, rating, comments, tipo, fila });
  res.json({ ok: true });
});

// Fallback SPA
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "Index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Servidor escuchando en :${port}`));
