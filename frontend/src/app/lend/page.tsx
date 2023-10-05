"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import "./style.css"

export default function Lend() {
    const { publicKey } = useWallet()
    const [amount, setAmount] = useState("")
    const [apy, setApy] = useState(0)

    // TODO: Implement action
    const HandleLend = () => {
        console.log("Call contract")
        console.log(amount)
        console.log(publicKey)
    }

    const SetApy = () => {
        console.log("Call contract")
        console.log(amount)
        console.log(publicKey)
    }

    return (
        <div className={"flex justify-center"}>
            <div className={"min-w-[500px] border-gray-100 border-2 shadow-xl rounded-lg p-10"}>
                <div className={"text-4xl font-bold text-purple-700"}>LEND</div>
                <div className={"text-gray-500 text-sm my-2"}>
                    Lend popular Solana tokens for
                    <span className={"font-bold"}> fixed returns</span>
                </div>
                <div className={"my-10"}>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            className="block w-full rounded-full px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-5 flex items-center">
                            <label htmlFor="token" className="sr-only">
                                Token
                            </label>
                            <select
                                id="token"
                                name="token"
                                className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                            >
                                <option>Token1</option>
                                <option>Token2</option>
                                <option>Token3</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className={"my-10"}>
                    <div className={"text-gray-500 text-sm my-2"}>Select a USDC-based maturity date:</div>
                    <button className={"rounded-full bg-green-200 w-fit py-4 px-6"} onClick={() => setApy(1.23)}>
                        <span className={"text-2xl font-bold"}>1.23</span>
                        <span>%APR</span>
                    </button>
                    <button className={"rounded-full bg-green-200 w-fit py-4 px-6"} onClick={() => setApy(1.6)}>
                        <span className={"text-2xl font-bold"}>1.6</span>
                        <span>%APR</span>
                    </button>
                    <button className={"rounded-full bg-green-200 w-fit py-4 px-6"} onClick={() => setApy(2.2)}>
                        <span className={"text-2xl font-bold"}>2.2</span>
                        <span>%APR</span>
                    </button>
                </div>
                <div className={"mt-16"}>
                    <button
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full w-full"
                        onClick={HandleLend}
                    >
                        Lend
                    </button>
                </div>
            </div>
        </div>
    )
}
