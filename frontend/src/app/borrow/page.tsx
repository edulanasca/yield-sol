"use client";

import {ChangeEvent, useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import useProgram from "@/program/useProgram";
import {borrow} from "@/program/instructions";

interface IToken {
    name: string
    symbol: string
    apr: number
}

export default function Borrow() {
    const {publicKey} = useWallet();
    const {program, connection} = useProgram();
    const [amount, setAmount] = useState('')
    const [token, setToken] = useState<IToken>()
    const [tokenList, setTokenList] = useState<IToken[]>([{
        name: 'USDT-29-12-2023', symbol: 'USDT29D', apr: 4.5
    }]);

    const handleBorrow = () => {
        if (program && publicKey) {
            borrow(connection, program, publicKey, parseInt(amount || "0"))
                .then(tx => console.log(tx))
                .catch(err => console.log(err));
        }
    }

    const handleOnChangeToken = (e: ChangeEvent<HTMLSelectElement>) => {
        const token = tokenList.find((t) => t.name === e.target.value)
        setToken(token)
    }

    return (
        <div className={'flex justify-center'}>
            <div className={'min-w-[500px] border-gray-100 border-2 shadow-xl rounded-lg p-10'}>
                <div className={'text-4xl font-bold text-purple-700'}>BORROW</div>
                <div className={'text-gray-500 text-sm my-2'}>
                    Borrow popular Solana tokens at a
                    {' '}<span className={'font-bold'}>fixed rate</span>
                </div>
                <div className={'my-10'}>

                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input type="number" name="amount" id="amount"
                               className="block w-full rounded-full px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                               placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                        <div className="absolute inset-y-0 right-5 flex items-center">
                            <select id="token" name="token"
                                    className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                    onChange={(e) => handleOnChangeToken(e)}
                            >
                                {tokenList.map((token) => <option key={token.name}
                                                                  value={token.name}>{token.symbol}</option>)}
                            </select>
                        </div>
                    </div>

                </div>
                <div className={'my-10'}>
                    <div className={'rounded-full bg-green-200 w-fit py-4 px-6'}>
                        <span className={'text-2xl font-bold'}>{token ? token.apr : '~'}</span>
                        <span>%APR</span>
                    </div>
                </div>
                <div className={'mt-16'}>
                    <button
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full w-full"
                        onClick={handleBorrow}
                    >
                        Next Step
                    </button>
                </div>
            </div>
        </div>
    )
}
