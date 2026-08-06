import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        default: 'Stream VC Demonlist',
        template: '%s | Stream VC Demonlist',
    },
    description: 'The Stream VC Geometry Dash demonlist.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}
