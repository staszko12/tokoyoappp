import './globals.css'

export const metadata = {
  title: 'Neon Tokyo | Trip Planner',
  description: 'Plan your dream trip to Japan with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <body suppressHydrationWarning className="bg-void text-white">{children}</body>
    </html>
  )
}

