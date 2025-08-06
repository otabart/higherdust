import type React from "react"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import ErrorBoundary from "@/components/error-boundary"
import { DevelopmentErrorSuppressor } from "@/components/development-error-suppressor"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] })

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Farcaster Mini App Embed Metadata */}
        <meta property="fc:miniapp" content='{"version":"1","imageUrl":"https://swapdust.vercel.app/og-image.png","button":{"title":"SWAPDUST","action":{"url":"https://swapdust.vercel.app"}}}' />
        
        {/* Preconnect to Quick Auth Server for performance */}
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
        
        {/* Disable CSP in development to avoid Chrome extension conflicts */}
        {process.env.NODE_ENV === 'development' && (
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: chrome-extension:; script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension:; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https: chrome-extension:; connect-src 'self' https: ws: wss: chrome-extension:; frame-src 'self' chrome-extension:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'" />
        )}
        
        {/* Handle EVM Ask extension conflicts */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent EVM Ask extension from redefining window.ethereum
            if (typeof window !== 'undefined') {
              const originalDefineProperty = Object.defineProperty;
              Object.defineProperty = function(obj, prop, descriptor) {
                if (obj === window && prop === 'ethereum' && window.ethereum) {
                  console.log('🛡️ Preventing EVM Ask extension from redefining window.ethereum');
                  return window.ethereum;
                }
                return originalDefineProperty.call(this, obj, prop, descriptor);
              };
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <DevelopmentErrorSuppressor>
            <Providers>
              <main className="min-h-screen">{children}</main>
            </Providers>
          </DevelopmentErrorSuppressor>
        </ErrorBoundary>
      </body>
    </html>
  )
}
