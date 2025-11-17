import Constants from "expo-constants";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.API_URL ||
  "http://localhost:3333";

const API_KEY =
  process.env.EXPO_PUBLIC_API_KEY ||
  Constants.expoConfig?.extra?.API_KEY ||
  "DEV_FORTALEZA_SEGURA";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, any>;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/json",
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro na API (${response.status}): ${errorText || response.statusText}`
    );
  }

  return (await response.json()) as T;
};

export const fetchHeatmap = () =>
  request<{ points: HeatPoint[]; geojson: any; updatedAt: string }>(
    "/api/v1/heatmap"
  );

export const fetchSecureRoute = (params: {
  origem: string;
  destino: string;
}) =>
  request<{
    polyline: string;
    coordinates: Coordinate[];
    etaMinutes: number;
    dangerScore: number;
  }>(`/api/v1/rota-segura?origem=${params.origem}&destino=${params.destino}`);

export const postDenuncia = (payload: {
  tipo: string;
  descricao?: string;
  latitude: number;
  longitude: number;
  userId?: string;
}) =>
  request<{ sucesso: true; denuncia: any }>("/api/v1/denuncias", {
    method: "POST",
    body: payload,
  });

export const postRastreamento = (payload: {
  latitude: number;
  longitude: number;
}) =>
  request<{ alerta: string | null; tipo?: string }>(
    "/api/v1/rastreamento-ativo",
    { method: "POST", body: payload }
  );

export const fetchFeed = (limit = 10) =>
  request<{ items: FeedItem[] }>(`/api/v1/feed-seguranca?limit=${limit}`);

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type HeatPoint = Coordinate & {
  weight: number;
  label?: string;
};

export type FeedItem = {
  id: string;
  tipo: string;
  descricao?: string;
  latitude: number;
  longitude: number;
  criadoEm: string;
};
