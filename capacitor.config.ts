import type { CapacitorConfig } from '@capacitor/cli'

// Configuração para empacotar o PWA como app nativo iOS (Capacitor).
// Requer instalar as dependências e gerar o projeto iOS num Mac com Xcode
// (ver MOBILE.md). Este arquivo é só o scaffold — não afeta o build web.
const config: CapacitorConfig = {
  appId: 'app.peptrack',
  appName: 'PepTrack',
  webDir: 'dist',
  ios: {
    contentInset: 'always'
  }
}

export default config
