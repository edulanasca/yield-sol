pub mod instructions;
pub mod errors;

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use instructions::*;
use errors::Error;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod yield_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        init_token(ctx).expect("Failed init Token");
        Ok(())
    }

    pub fn lend(ctx: Context<Lend>, amount_lend: u64) -> Result<()> {
        // Reference to the vault
        let vault = &mut ctx.accounts.vault;
    
        // Ensure the token being lent is the collateral token
        if *ctx.accounts.from_collateral_account.to_account_info().key != vault.collateral_token {
            return err!(Error::InsufficientCollateral);
        }
    
        // Transfer the specified amount from the user's account to the vault's collateral account
        let seeds = &["collateral".as_bytes(), &[*ctx.bumps.get("collateral").unwrap()]];
        let signer = [&seeds[..]];
        
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.from_collateral_account.to_account_info(),
                    to: ctx.accounts.to_vault_collateral_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &signer,
            ),
            amount_lend,
        )?;
    
        // Update the vault's collateral amount
        vault.collateral_amount += amount_lend;
    
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, amount_borrow: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        if vault.collateral_amount > amount_borrow.checked_mul(12).unwrap() / 10 {
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
pub struct Borrow<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
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
    #[account(mut)]
    pub to_vault_collateral_account: Account<'info, TokenAccount>, 
    #[account(signer)]
    pub authority: AccountInfo<'info>, 
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(Default)]
pub struct Vault {
    collateral_token: Pubkey,
    collateral_amount: u64,
    borrow_token: Pubkey,
    borrow_amount: u64,
}

