# PepTrack

PWA pessoal, **offline** e **single-user** para rastreamento de protocolo de peptídeos.
Sem backend, sem login, sem analytics — todos os dados ficam no seu dispositivo (IndexedDB).

> **Apenas para referência educacional. Não constitui orientação médica.
> Consulte um profissional de saúde qualificado.**

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Dexie (IndexedDB) · dexie-react-hooks ·
react-router-dom · Recharts · vite-plugin-pwa. Interface em Português (Brasil), unidades
métricas (kg, ml, mcg).

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:5173`).

Outros comandos:

```bash
npm run build     # type-check + build de produção (gera o service worker)
npm run preview   # serve o build de produção localmente
```

Os ícones do PWA são gerados por `node scripts/gen-icons.mjs` (sem dependências;
já commitados em `public/`).

## Instalar no iPhone (via Safari)

O iOS só instala PWAs pelo **Safari**:

1. Faça o deploy (Vercel/Netlify) ou sirva o build por HTTPS e abra a URL **no Safari**.
2. Toque em **Compartilhar** (o quadrado com a seta para cima).
3. Escolha **Adicionar à Tela de Início**.
4. Confirme. O PepTrack abre em **tela cheia** (standalone) e funciona **100% offline**
   após o primeiro carregamento.

## Funcionalidades

- **Protocolo (home):** agenda do dia, card de aderência com anel de progresso,
  registro de dose em bottom sheet (≤3 toques a partir da home), rotação de locais
  de aplicação, alertas de frasco.
- **Progresso:** aderência 30 dias, streak, total de doses, gráfico de aderência e
  acompanhamento de peso.
- **Biblioteca:** 12 compostos pré-carregados com ficha educacional, busca e filtros,
  calculadora de reconstituição (seringa U-100) e rastreamento de frascos.
- **Você:** perfil, notificações (Notification API), exportar/importar backup JSON,
  limpar todos os dados.

## Privacidade

Nada sai do dispositivo. O backup é um arquivo JSON gerado e baixado localmente,
restaurável pela função **Importar backup**.
