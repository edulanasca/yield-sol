pub mod instructions;
pub mod errors;

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use instructions::*;
use errors::Error;

declare_id!("6D9vUu1jUuyYRTxZR5EMTM6sczptWWyK9Co6ty8gFL1x");

#[program]
pub mod yield_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        init_token(ctx).expect("Failed init Token");
        Ok(())
    }

    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.collateral_amount = 0;
        vault.borrow_amount = 0;
        Ok(())
    }

    pub fn lend(ctx: Context<Lend>, amount_lend: u64) -> Result<()> {
        // Reference to the vault
        let vault = &mut ctx.accounts.vault;

        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.from_collateral_account.to_account_info(),
                    to: ctx.accounts.to_vault_collateral_account.to_account_info(),
                    authority: ctx.accounts.signer.to_account_info(),
                },
            ),
            amount_lend,
        )?;

        let seeds = &["mint".as_bytes(), &[254]];
        let signer = [&seeds[..]];
        msg!("{} | {}",ctx.accounts.destination.key(), ctx.accounts.mint2.key());
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.mint2.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    mint: ctx.accounts.mint2.to_account_info(),
                },
                &signer,
            ),
            (amount_lend / 1000) * 8,
        )?;

        // Update the vault's collateral amount
        vault.collateral_amount += amount_lend;

        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, amount_borrow: u64) -> Result<()> {
        let collateral_amount = ctx.accounts.vault_collateral.amount;
        let borrow_amount = ctx.accounts.destination.amount;

        let collateral_left = collateral_amount.checked_sub(borrow_amount.checked_mul(100).unwrap_or(0)).unwrap();
        msg!("Collateral left {}", collateral_left);
        if collateral_left >= amount_borrow.checked_mul(120).unwrap() {
            // mint borrow_token and transfer to user
            let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("mint").unwrap()]];
            let signer = [&seeds[..]];

            mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        authority: ctx.accounts.mint.to_account_info(),
                        to: ctx.accounts.destination.to_account_info(),
                        mint: ctx.accounts.mint.to_account_info(),
                    },
                    &signer,
                ),
                amount_borrow,
            )?;

            Ok(())
        } else {
            msg!("Collateral left {}", collateral_left);
            return err!(Error::InsufficientCollateral);
        }
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(
    init,
    seeds = [b"mint"],
    bump,
    payer = payer,
    mint::decimals = 4,
    mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: account constraint checked in account trait
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,

}

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account(
    init,
    seeds = [b"vault", signer.key().as_ref(), mint.key().as_ref()],
    payer = signer,
    space = 8 + 32 + 8 + 32 + 8,
    bump
    )]
    pub vault: Account<'info, Vault>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_collateral: Account<'info, TokenAccount>,
    #[account(
    mut,
    seeds = [b"mint"],
    bump,
    mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
    init_if_needed,
    payer = payer,
    associated_token::mint = mint,
    associated_token::authority = payer,
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Lend<'info> {
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub from_collateral_account: Account<'info, TokenAccount>,
    #[account(
    init_if_needed,
    payer = signer,
    associated_token::mint = mint,
    associated_token::authority = vault,
    )]
    pub to_vault_collateral_account: Account<'info, TokenAccount>,
    #[account(
    init_if_needed,
    payer = signer,
    associated_token::mint = mint2,
    associated_token::authority = signer,
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub mint2: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct Vault {
    collateral_token: Pubkey,
    collateral_amount: u64,
    borrow_token: Pubkey,
    borrow_amount: u64,
}

