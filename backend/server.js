const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3333;
const API_KEY = process.env.API_KEY || "DEV_FORTALEZA_SEGURA";

app.use(cors());
app.use(express.json());

// Simple API key guard for every endpoint
app.use((req, res, next) => {
  if (req.path === "/healthz") return next();
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (token !== API_KEY) {
    return res.status(401).json({ message: "API key inválida" });
  }
  next();
});

const denuncias = [];

const baseHeatmap = [
  { latitude: -3.7319, longitude: -38.5267, weight: 0.4, label: "Centro" },
  { latitude: -3.7368, longitude: -38.4978, weight: 0.5, label: "Aldeota" },
  { latitude: -3.7939, longitude: -38.5885, weight: 0.6, label: "Messejana" },
];

const haversine = (coord1, coord2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371e3; // meters
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const encodePolyline = (coordinates) => {
  let lastLat = 0;
  let lastLng = 0;
  let result = "";

  const encode = (num) => {
    num = Math.round(num * 1e5);
    num <<= 1;
    if (num < 0) {
      num = ~num;
    }
    let encoded = "";
    while (num >= 0x20) {
      encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
      num >>= 5;
    }
    encoded += String.fromCharCode(num + 63);
    return encoded;
  };

  coordinates.forEach(({ latitude, longitude }) => {
    const lat = latitude - lastLat;
    const lng = longitude - lastLng;
    result += encode(lat);
    result += encode(lng);
    lastLat = latitude;
    lastLng = longitude;
  });

  return result;
};

const buildHeatmapGeoJSON = () => {
  const weighted = [...baseHeatmap];
  denuncias.forEach((denuncia) => {
    weighted.push({
      latitude: denuncia.latitude,
      longitude: denuncia.longitude,
      weight: 0.9,
      label: denuncia.tipo,
    });
  });
  return {
    type: "FeatureCollection",
    features: weighted.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
      properties: { level: p.weight, label: p.label },
    })),
  };
};

app.get("/healthz", (_, res) => res.json({ ok: true }));

app.get("/api/v1/heatmap", (req, res) => {
  const geo = buildHeatmapGeoJSON();
  res.json({
    updatedAt: new Date().toISOString(),
    points: geo.features.map((f) => ({
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      weight: f.properties.level,
      label: f.properties.label,
    })),
    geojson: geo,
  });
});

app.get("/api/v1/rota-segura", (req, res) => {
  const { origem, destino } = req.query;
  if (!origem || !destino) {
    return res
      .status(400)
      .json({ message: "Parâmetros origem e destino são obrigatórios" });
  }

  const [oLat, oLng] = origem.split(",").map(Number);
  const [dLat, dLng] = destino.split(",").map(Number);
  const midLat = (oLat + dLat) / 2 + 0.002;
  const midLng = (oLng + dLng) / 2 - 0.002;

  const coordinates = [
    { latitude: oLat, longitude: oLng },
    { latitude: midLat, longitude: midLng },
    { latitude: dLat, longitude: dLng },
  ];

  return res.json({
    dangerScore: 0.32,
    etaMinutes: 12,
    polyline: encodePolyline(coordinates),
    coordinates,
  });
});

app.post("/api/v1/denuncias", (req, res) => {
  const { tipo, latitude, longitude, descricao, userId } = req.body || {};
  if (!tipo || !latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Campos tipo, latitude e longitude são obrigatórios" });
  }

  const denuncia = {
    id: `${Date.now()}`,
    tipo,
    descricao: descricao || "",
    latitude,
    longitude,
    userId: userId || "anon",
    createdAt: new Date(),
  };
  denuncias.push(denuncia);
  return res.status(201).json({ sucesso: true, denuncia });
});

app.post("/api/v1/rastreamento-ativo", (req, res) => {
  const { latitude, longitude } = req.body || {};
  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "latitude e longitude são obrigatórios" });
  }

  const agora = Date.now();
  const perigoRecente = denuncias.find((d) => {
    const recente = agora - new Date(d.createdAt).getTime() < 15 * 60 * 1000;
    const distancia = haversine(
      { latitude, longitude },
      { latitude: d.latitude, longitude: d.longitude }
    );
    return recente && distancia < 500;
  });

  if (perigoRecente) {
    return res.json({
      alerta: "PERIGO_IMINENTE",
      tipo: perigoRecente.tipo,
      origemDenuncia: perigoRecente.id,
    });
  }

  return res.json({ alerta: null, status: "OK" });
});

app.get("/api/v1/feed-seguranca", (req, res) => {
  const limite = Number(req.query.limit) || 10;
  const feed = denuncias
    .slice(-limite)
    .reverse()
    .map((d) => ({
      id: d.id,
      tipo: d.tipo,
      descricao: d.descricao,
      latitude: d.latitude,
      longitude: d.longitude,
      criadoEm: d.createdAt,
    }));
  res.json({ items: feed });
});

app.listen(PORT, () => {
  console.log(`fortaleza-segura rodando em http://localhost:${PORT}`);
});
