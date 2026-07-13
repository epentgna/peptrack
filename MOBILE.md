# App nativo iOS + Assinatura da Apple

Guia para transformar o PWA em app nativo iOS (via **Capacitor**) e cobrar
com a **assinatura da Apple (In-App Purchase)** usando **RevenueCat**.

> ⚠️ **Antes de investir nisso, leia o aviso da App Store no fim.** Um app
> sobre peptídeos tem risco real de rejeição na revisão da Apple.

## Pré-requisitos (você precisa)
- Um **Mac** com **Xcode** instalado.
- Conta **Apple Developer** (US$ 99/ano).
- Conta **RevenueCat** (grátis até certo faturamento) — facilita a assinatura.

## 1. Instalar Capacitor (uma vez)
```bash
npm i @capacitor/core @capacitor/ios
npm i -D @capacitor/cli
npx cap add ios        # gera a pasta ios/ (precisa de Mac)
npm run build          # gera dist/
npx cap sync ios       # copia o web build para o app nativo
npx cap open ios       # abre no Xcode
```
O `capacitor.config.ts` já está no repositório.

## 2. Assinatura (In-App Purchase via RevenueCat)
1. No **App Store Connect**, crie o app e um produto de **assinatura**
   (mensal/anual) com preços.
2. No **RevenueCat**, conecte o app e crie um *entitlement* (ex.: `pro`).
3. No app, instale o plugin: `npm i @revenuecat/purchases-capacitor`.
4. Inicialize com a API key do RevenueCat e mostre os pacotes na tela de
   paywall. Ao comprar, o RevenueCat concede o *entitlement* `pro`.
5. O app libera os recursos premium quando o *entitlement* está ativo.
   (O status também pode ser espelhado no Supabase via webhook do RevenueCat,
   para o site/PWA reconhecer a assinatura.)

> A Apple **exige** o uso do In-App Purchase para assinaturas digitais dentro
> do app iOS (não é permitido Stripe/checkout externo para isso). A Apple
> retém **15–30%**.

## 3. Enviar para revisão
- Ícones/splash, nome, capturas de tela, descrição.
- Preencher privacidade ("Nutrition Labels") e a URL da Política de
  Privacidade (já temos `/privacidade`, revisar com advogado).
- Enviar pelo Xcode / App Store Connect e aguardar a revisão.

## ⚠️ Aviso importante — risco na App Store
A Apple é rígida com apps de saúde/substâncias. Um app que rastreia o uso de
peptídeos injetáveis (majoritariamente não aprovados) pode ser **rejeitado**
nas diretrizes de revisão. Antes de gastar tempo/dinheiro:
- Posicione **estritamente** como registro/educação (nunca sugerir dose — já
  é assim).
- Considere **começar pela web (PWA + pagamento web)**, que **não passa pela
  revisão da Apple** e evita esse risco, e só depois tentar a App Store.
