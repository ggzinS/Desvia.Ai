# Rotas-Seguras — Implementações e Como Rodar

## O que foi implementado (lista marcada)
- Backend demo `fortaleza-segura` com endpoints: heatmap, rota segura, denúncias, rastreamento e feed (rota com API key).
- Serviço de API no app centralizando chamadas com chave e URL configuráveis.
- Mapa com heatmap permanente, círculos e marcadores de risco coloridos por nível.
- Busca com autocomplete filtrado para Fortaleza; sugestões locais de fallback.
- Seleção de destino abre pop-up para escolher tipo de rota (segura/rápida) e transporte (carro/moto/ônibus/a pé).
- Roteamento: tenta OSRM público primeiro e cai para backend; fallback direto ponto-a-ponto se necessário.
- Câmera animada estilo Waze (pitch, fitToCoordinates, heading).
- Rastreamento com alertas de perigo recente; modal de alerta e botão para desvio.
- Denúncia com modal, envia localização e atualiza heatmap/feed; feed de segurança em modal.
- UI limpa: menu inferior funcional, SOS, e setinha acompanhando o usuário.

## Como rodar local
1) Instalar dependências (já incluí backend demo):
   ```bash
   npm install
   ```
2) Subir backend local (porta 3333):
   ```bash
   npm run backend
   ```
3) Rodar o app Expo:
   ```bash
   npm start
   ```
   Abra no Android (`a`) ou web (`w`).
4) Uso rápido:
   - Digite um destino em Fortaleza, aperte Enter, escolha na lista.
   - No pop-up, selecione rota (segura/rápida) e transporte, depois “Iniciar”.
   - Mapa mostra heatmap, rota e segue sua posição com câmera inclinada.
   - Botão “Reportar” envia denúncia; “Feed” mostra relatos; alerta de perigo gera modal.

## Observações
- Variáveis públicas (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_KEY`) estão em `.env`/`app.json`.
- OSRM público é para demo; para produção, use instância própria ou provedor dedicado.
