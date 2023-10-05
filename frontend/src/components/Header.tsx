"use client"
import dynamic from "next/dynamic"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const WalletMultiButtonDynamic = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false },
)

const Header = () => {
    const pathname = usePathname()

    return (
        <div className={"flex justify-between items-center p-2"}>
            <div className={"flex gap-8 text-lg p-4"}>
                <Link href={"/borrow"} className={pathname === "/borrow" ? "font-bold" : ""}>
                    Borrow
                </Link>
                <Link href={"/lend"} className={pathname === "/lend" ? "font-bold" : ""}>
                    Lend
                </Link>
            </div>
            <div className={"bg-black rounded-lg"}>
                <WalletMultiButtonDynamic />
            </div>
        </div>
    )
}

export default Header
