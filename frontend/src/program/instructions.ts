import {
    Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction
} from "@solana/web3.js";
import {Address, Program, BN} from "@coral-xyz/anchor";
import yieldSolIdl from "../../../target/idl/yield_sol.json";
import {YieldSol} from "../../../target/types/yield_sol";
import {getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {ASSOCIATED_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";

export const USDC = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const IDL: YieldSol = yieldSolIdl;

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export function getMintAddress(programId: PublicKey) {
    return PublicKey.findProgramAddressSync([Buffer.from("mint")], programId);
}

export function getVaultAddress(payer: Address, programId: PublicKey) {
    return PublicKey.findProgramAddressSync([
        Buffer.from("vault"), new PublicKey(payer).toBuffer(), getMintAddress(programId)[0].toBuffer()
    ], programId);
}

export async function initialize(connection: Connection, program: Program<YieldSol>, payer: Address) {
    const acc = await connection.getAccountInfo(getMintAddress(program.programId)[0]);
    if (acc == null) {

        const [mint] = PublicKey.findProgramAddressSync(
            [Buffer.from("mint")],
            program.programId
        );

        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );
        try {
            const tx = await program.methods.initialize().accounts({
                metadata: metadataAddress,
                mint,
                payer,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            }).rpc();
            console.log(tx);
        } catch (err) {
            console.log(err);
        }
    }
}

export function initialize_vault(connection: Connection, program: Program<YieldSol>, payer: Address) {
    const [vaultAddress] = getVaultAddress(payer, program.programId);

    return program.methods.initVault().accounts({
        vault: vaultAddress,
        mint: getMintAddress(program.programId)[0],
        signer: payer,
        systemProgram: SystemProgram.programId
    }).instruction();
}

export async function lend(connection: Connection, program: Program<YieldSol>, payer: Address, amount_lend: number) {
    const [vaultAddress] = getVaultAddress(payer, program.programId);
    const signer = new PublicKey(payer);
    const collateralAta = getAssociatedTokenAddressSync(USDC, signer);
    const collateralVaultAta = getAssociatedTokenAddressSync(USDC, vaultAddress, true);
    const ixs: TransactionInstruction[] = [];

    if (!await connection.getAccountInfo(vaultAddress)) {
        console.log('here')
        ixs.push(await initialize_vault(connection, program, payer));
    }

    return await program.methods.lend(new BN(amount_lend * (10 ** 6))).accounts({
        vault: vaultAddress,
        fromCollateralAccount: collateralAta,
        toVaultCollateralAccount: collateralVaultAta,
        mint: USDC,
        signer,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
    }).preInstructions(ixs).rpc();
}

export async function borrow(connection: Connection, program: Program<YieldSol>, payer: Address, amount_borrow: number) {
    const [vaultAddress] = getVaultAddress(payer, program.programId);
    const signer = new PublicKey(payer);
    const borrowAta = getAssociatedTokenAddressSync(getMintAddress(program.programId)[0], signer);
    const collateralVaultAta = getAssociatedTokenAddressSync(USDC, vaultAddress, true);
    const ixs: TransactionInstruction[] = [];

    if (!await connection.getAccountInfo(vaultAddress)) {
        ixs.push(await initialize_vault(connection, program, payer));
    }

    return await program.methods.borrow(new BN(amount_borrow * (10 ** 4))).accounts({
        vault: vaultAddress,
        vaultCollateral: collateralVaultAta,
        mint: getMintAddress(program.programId)[0],
        destination: borrowAta,
        payer: signer,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID
    }).preInstructions(ixs).rpc();
}
