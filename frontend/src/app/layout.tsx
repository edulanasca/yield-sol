import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import { Providers } from "@/providers"

require("@solana/wallet-adapter-react-ui/styles.css")

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Yield Sol",
    description: "Yield Sol",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <Header />
                    {children}
                </Providers>
            </body>
        </html>
    )
}
