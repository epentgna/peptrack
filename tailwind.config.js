/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#05080F',
        card: '#0B1220',
        border: '#1B2A3F',
        cyan: '#22D3EE',
        ink: '#E8EEF6',
        muted: '#8A97A8',
        danger: '#F43F5E'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.35)',
        'glow-sm': '0 0 12px rgba(34, 211, 238, 0.25)'
      },
      borderRadius: {
        card: '18px'
      },
      maxWidth: {
        app: '28rem'
      }
    }
  },
  plugins: []
}
