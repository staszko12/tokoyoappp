import './globals.css'

export const metadata = {
  title: 'Japan Trip Planner',
  description: 'Plan your dream trip to Japan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
