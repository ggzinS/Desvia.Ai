# Rotas-Seguras / Fortaleza-Segura

Aplicativo Expo + backend Express simples para demonstrar rotas seguras, heatmap, denúncias e rastreamento em tempo real.

## Como rodar rápido (demo local)
1) Instale dependências: `npm install`
2) Suba o backend (fortaleza-segura): `npm run backend`
   - Porta: `http://localhost:3333`
   - Chave: `DEV_FORTALEZA_SEGURA` (configure em `.env` se quiser mudar)
3) Inicie o app Expo: `npm start`
4) Toque e segure no mapa para definir o destino. Use os botões:
   - `Rota segura`: busca rota no backend e desenha polyline.
   - `Reportar`: envia denúncia (usa localização atual) e atualiza heatmap/feed.
   - `Feed`: lista denúncias recentes.
   - `Iniciar/Parar`: ativa rastreamento e mostra alerta se houver perigo próximo.

## Endpoints disponíveis
- `GET /api/v1/heatmap` — GeoJSON + pontos para renderizar heatmap.
- `GET /api/v1/rota-segura?origem=lat,lng&destino=lat,lng` — polyline e pontos da rota mais segura.
- `POST /api/v1/denuncias` — registra denúncia `{ tipo, latitude, longitude, descricao?, userId? }`.
- `POST /api/v1/rastreamento-ativo` — rastreia posição em tempo real e retorna alerta se houver denúncia recente próxima.
- `GET /api/v1/feed-seguranca` — feed das últimas denúncias públicas.

## Deploy
O backend é stateless e pronto para ser empacotado em serviços como Render/Vercel/Heroku:
- Defina `API_KEY` no ambiente.
- Expõe `PORT` automaticamente; local usa 3333.
- Atualize `EXPO_PUBLIC_API_URL` no `.env`/`app.json` para o host público.
