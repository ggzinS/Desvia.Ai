import type { GeoJSON } from 'geojson';

/**
 * Estrutura padrão de coordenadas geográficas compatível com `location.coords` do expo-location
 * utilizada na `menu.tsx` para centralizar o mapa e enviar localização em diferentes fluxos.
 */
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/**
 * Lista restrita dos tipos de denúncia aceitos pelo fluxo da aba "Reporte" em `TabsNavegation.tsx`.
 */
export type TiposDenuncia =
  | 'ASSALTO'
  | 'FURTO'
  | 'ROUBO'
  | 'VANDALISMO'
  | 'ILUMINACAO_PRECARIA'
  | 'LOCAL_ABANDONADO'
  | 'OUTRO';

/**
 * Carga útil enviada ao endpoint de registro de denúncias (`POST /api/v1/denuncias`).
 * Consumida quando o usuário relata um incidente na aba "Reporte".
 */
export interface DenunciaPayload {
  tipo: TiposDenuncia;
  descricao?: string;
  localizacao: Coordenadas;
}

/**
 * Parâmetros de consulta necessários para calcular a rota segura na aba "Rotas".
 * A origem vem da localização atual (`menu.tsx`) e o destino do campo de busca do header (`Header.tsx`).
 */
export interface RotaRequestParams {
  origemLat: number;
  origemLng: number;
  destinoLat: number;
  destinoLng: number;
}

/**
 * Representa a resposta do endpoint `GET /api/v1/rota-segura`, contendo os dados da rota sugerida.
 */
export interface Rota {
  polyline: string;
  distanciaEmMetros: number;
  tempoEstimadoSegundos: number;
}

/**
 * Estrutura do pedido de socorro disparado pelo botão flutuante "SOS" em `menu.tsx`.
 */
export interface SosPayload {
  localizacao: Coordenadas;
}

/**
 * Estrutura GeoJSON retornada pelo endpoint de mapa de calor (`GET /api/v1/heatmap`).
 * Consumida pelo `MapView` exibido em `menu.tsx`.
 */
export type { GeoJSON };
