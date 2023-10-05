import {Program, AnchorProvider} from "@coral-xyz/anchor";
import {useEffect, useState} from "react";
import {useAnchorWallet, useConnection} from "@solana/wallet-adapter-react";

import {PublicKey} from "@solana/web3.js";
import {YieldSol} from "../../../target/types/yield_sol";
import {IDL, initialize} from "@/program/instructions";

export default function useProgram() {
    const {connection} = useConnection();
    const wallet = useAnchorWallet();
    const [program, setProgram] = useState<Program<YieldSol>>();

    const preflightCommitment = "processed";
    const commitment = "processed";

    useEffect(() => {
        if (wallet) {
            const programId = new PublicKey("6D9vUu1jUuyYRTxZR5EMTM6sczptWWyK9Co6ty8gFL1x");
            const provider = new AnchorProvider(connection, wallet, {preflightCommitment, commitment});
            const program = new Program(IDL, programId, provider);
            setProgram(program);
            initialize(connection, program, wallet.publicKey).catch(err => console.log(err))
        }

    }, [wallet]);

    return {
        connection, wallet, program
    }
}