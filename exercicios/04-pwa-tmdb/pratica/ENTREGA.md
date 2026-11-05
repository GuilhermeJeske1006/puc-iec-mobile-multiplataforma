# ENTREGA — Atividade 4 (PWA)

> Preencha e faça commit junto com o código. Esta parte vale 3 pts (avaliação manual no Canvas).

**Nome:** Guilherme Jeske · **GitHub:** GuilhermeJeske1006

---

## 1. Site comum × PWA — o que EU vi (3 diferenças)

Abra `https://pwa-tmdb-aula4.vercel.app` e compare com um site comum (ex.: themoviedb.org). Modo avião → recarregar; fechar e reabrir; instalar.

| # | Site comum (themoviedb.org) | PWA (pwa-tmdb-aula4.vercel.app) | Print/evidência |
|---|---|---|---|
| 1 | **Recarregar offline:** página de erro do navegador (dinossauro, `net::ERR_INTERNET_DISCONNECTED`) | Recarrega normalmente e mostra os 20 filmes (HTML/JS do precache do SW + dados do IndexedDB) | [`01-site-offline-reload.png`](evidencias/01-site-offline-reload.png) × [`01-pwa-offline-reload.png`](evidencias/01-pwa-offline-reload.png) |
| 2 | **Service Worker / Cache Storage:** nenhum SW registrado (`swRegistrations: []`), página sem controller, `caches: {}`, sem IndexedDB | `sw.js` *activated* com escopo `/`, página controlada por ele, cache `workbox-precache-v2-…` com 8 entradas e IndexedDB `tmdb-cache` | [`01-pwa-manifest-sw.png`](evidencias/01-pwa-manifest-sw.png) |
| 3 | **Fechar e reabrir sem rede:** sem SW não há o que servir → mesmo erro do item 1 | Nova aba aberta já offline → o app abre e lista os filmes, controlado pelo SW | [`01-pwa-reopen-offline.png`](evidencias/01-pwa-reopen-offline.png) |

> Observação: o themoviedb.org **também** tem manifest com `display: standalone` (dá pra "instalar" o atalho), então ser instalável não foi o que diferenciou os dois — a diferença real é o Service Worker + cache, que faz o PWA abrir e funcionar sem rede. Os prints foram gerados com Playwright (Chromium headless, `context.setOffline(true)`); o painel de dados foi coletado com `page.evaluate()` (manifest, `serviceWorker.getRegistrations()`, `caches.keys()`).

## 2. Prova do offline no SEU build

- [x] **Cache Storage** com `tmdb-api` e `tmdb-images` (com itens) → [`02-cache-storage.png`](evidencias/02-cache-storage.png)
  - `tmdb-api`: **3** entradas (`/3/movie/popular?language=pt-BR&page=1..3`) · `tmdb-images`: **47** pôsteres (`image.tmdb.org/t/p/w342/...`) · `workbox-precache-v2`: 8 entradas (app shell)
  - Listagem feita com `caches.keys()` / `caches.open(nome).keys()` via Playwright (mesmos dados do painel DevTools → Application → Cache Storage)
- [x] App em **modo avião** carregando a lista → [`02-app-offline.png`](evidencias/02-app-offline.png) e aba Favoritos com o banner `📡 Offline — exibindo dados do cache` → [`02-favoritos-offline.png`](evidencias/02-favoritos-offline.png)
  - carimbo amarelo no print: `context.offline=true · navigator.onLine=false · SW controller=http://localhost:4173/sw.js`
- [x] Aviso **"Nova versão disponível"** → [`02-nova-versao.png`](evidencias/02-nova-versao.png); após **Atualizar** a página recarrega com o título novo (`🎬 Filmes Populares · v2`) → [`02-apos-atualizar.png`](evidencias/02-apos-atualizar.png)
  - Na 1ª visita aparece **"App pronto para uso offline"** → [`02-offline-ready.png`](evidencias/02-offline-ready.png)

**Como reproduzi:** `npm run build && npm run preview` → 1ª visita (aviso offline-ready) → recarregar (página passa a ser controlada pelo SW e o `runtimeCaching` intercepta API e pôsteres) → rolar a lista e favoritar 2 filmes → offline + recarregar → aba Favoritos → online → alterar o título do `AppHeader`, `npm run build` com o preview no ar, `registration.update()` (= botão *Update* do DevTools) → aviso "Nova versão" → **Atualizar**. A alteração do título foi só para o teste e foi revertida. Fluxo automatizado com Playwright (Chromium headless).

## 3. Reflexão (5–8 linhas)

`autoUpdate` × `prompt`: qual você escolheria para um app de **checkout** e para um app de **notícias**, e por quê? O que pode dar errado em cada escolha?

**Checkout → `prompt`.** O usuário pode estar no meio de um pagamento (carrinho montado, formulário de cartão preenchido, aguardando 3-D Secure). Com `autoUpdate` o novo SW assume e a página recarrega sozinha: o estado em memória some e, pior, a versão nova do JS pode conversar com uma API que mudou de contrato em relação ao HTML/JS já carregado → pedido duplicado ou perdido. Com `prompt` o usuário termina a compra e só então clica **Atualizar**. Risco do `prompt`: o usuário clica **Depois** para sempre e fica numa versão velha (ex.: com bug de cálculo de frete) — mitigação: versionar a API/aceitar versões antigas por um tempo e, em correção crítica, forçar o update no próximo carregamento.

**Notícias → `autoUpdate`.** Conteúdo é leitura rápida, sem estado importante a perder; o valor está em sempre mostrar o layout/correções mais recentes sem incomodar o leitor com banners. Risco: recarregar no meio da leitura (perde a rolagem) ou carregar chunks antigos que já não existem no servidor após o deploy → mitigação: ativar o SW novo só na próxima navegação e manter os assets antigos publicados por um tempo.

## 4. Declaração de uso de IA

Usei IA? Onde e como? (uso transparente é incentivado)

Sim. Usei o **Claude Code** (Anthropic) como assistente: ele leu os TODOs/enunciado e o validador, propôs e aplicou a implementação (TODOs 1–5), rodou `npm test`, `npm run build` e o validador local (12/12), automatizou a captura de prints com Playwright (pasta `evidencias/`), fez uma revisão de código (que levou a 3 ajustes: skeleton na aba Favoritos durante o carregamento, `purgeOnQuotaError` no cache de pôsteres e checagem de nova versão a cada 1 h) e rodou testes E2E/exploratórios (15/15 cenários ok; a suíte `tests/e2e` do scaffold tem 3 falhas do próprio spec — `toHaveCountGreaterThan` não existe no Playwright e o teste de busca usa viewport desktop, onde a barra de abas fica oculta). Revisei o código e as decisões — em especial o host dos pôsteres (`image.tmdb.org`, diferente da API `api.themoviedb.org`) e o `cacheableResponse: [0, 200]` para resposta opaca — e escrevi a reflexão a partir da discussão.
