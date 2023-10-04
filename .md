# Project: Name TBD

## What is it?
**Yield-Sol** is a yield protocol built on Solana. At its core, this protocol allows users to borrow assets by overcollateralizing their loans. This ensures a secure and transparent borrowing experience.

Unlike traditional lending platforms, our system requires a 120% collateral, meaning that for every $100 (in any asset) you wish to borrow, you’d need to deposit $120 USDC. This overcollateralization is designed to safeguard the interests of both borrowers and lenders by providing an added layer of security and trust to the ecosystem.

## Why use overcollateralized lending?
1. **Safety and Security:** Over-collateralizing ensures that the loan is always backed by more than it's worth. This means lenders are more likely to get their money back, making the system resilient against market fluctuations or sudden drops in value.  
2. **Avoiding liquidation:** Even if the value of the collateral drops due to market volatility, having an overcollateralized loan gives borrowers a buffer.

## How it works
1. Connect your wallet 
2. Choose borrow or lend

### For borrowers:
1. Determine the token and amount you want to borrow
2. Make sure you have enough collateral (120% of the borrow amount)
3. Enter the amount and confirm the transaction in your wallet
<img src="https://github.com/edulanasca/yield-sol/assets/72363956/632a32af-2fd6-47e7-a1bf-ea27fc06a8da" width="1000">

### For lenders:
1. Determine the token and amount you want to lend out 
2. Enter the amount and note the yield you will receive 
3. Confirm the transaction in your wallet
4. Send USDC to the smart contract
5. Once you've confirmed and authorize the transaction in your wallet, you will receive a notification and your position will be updated on our platform
<img src="https://github.com/edulanasca/yield-sol/assets/72363956/4e83d5d5-8c1d-4e3b-a4e0-598c55766126" width="1000">

#### Borrowers Repayment
- Monitor your loan status and health.
- After paying your loan, navigate to the withdraw section, select the amount, and confirm the transaction to retrieve your collateral

#### Lenders
- Monitor lending position
- Check your lending position and generated yield
- To withdraw your lent assets and generated yield, navigate to the withdraw section, select the amount and confirm the transaction

## FAQ
- **Which wallets are compatible?** Phantom, Solflare
- **What assets are supported?** All Solana assets
- **What are the associated fees?** No fees
- **How is yield calculated?** Secret
- **What happens during market volatility?** Because of the overcollateralization of the loans, market volatility is not a problem. Black swan events will trigger liquidations.

## team 
- barto.9388
- axia7316
- llama#0106
- Arthas#5837
- jhintux
- mick2887

## missing element
- loom video
- installation process
- photo of the front-end
- add the mathematical formulas
