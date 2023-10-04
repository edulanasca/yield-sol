use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use crate::Initialize;
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, CreateMetadataAccountV3InstructionArgs};
use mpl_token_metadata::types::DataV2;

pub fn init_token(ctx: Context<Initialize>) -> Result<()> {
    let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("mint").unwrap()]];
    let signer = [&seeds[..]];

    let account_info = vec![
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];


    let create_metadata_acc = CreateMetadataAccountV3 {
        metadata: ctx.accounts.metadata.key(),
        mint: ctx.accounts.mint.key(),
        mint_authority: ctx.accounts.mint.key(),
        payer: ctx.accounts.payer.key(),
        update_authority: ctx.accounts.mint.key(),
        system_program: ctx.accounts.system_program.key(),
        rent: Some(ctx.accounts.rent.key()),
    };

    let a = create_metadata_acc.instruction(CreateMetadataAccountV3InstructionArgs {
        data: DataV2 {
            name: "USDT-29-12-2023".to_string(),
            symbol: "USDT29D".to_string(),
            uri: "".to_string(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        is_mutable: true,
        collection_details: None,
    });

    invoke_signed(&a, account_info.as_slice(), &signer)?;

    msg!("Token mint created successfully.");

    Ok(())
}