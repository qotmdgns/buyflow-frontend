import "./globals.css"

export const metadata = {
  title: "물류 ERP 시스템",
  description: "입고 및 재고 관리 시스템",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
