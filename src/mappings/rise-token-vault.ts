import {
	RiseTokenBurned,
	RiseTokenCreated,
	RiseTokenMinted,
	RiseTokenRebalanced,
	SupplyAdded,
	SupplyRemoved,
} from "../types/RiseTokenVault/RiseTokenVault";
import {
	Burn,
	Deposit,
	Mint,
	Rebalance,
	RiseToken,
	Withdraw,
} from "../types/schema";

export function handleRiseTokenCreated(event: RiseTokenCreated): void {
	let riseToken = RiseToken.load(event.transaction.hash.toHex());
	if (!riseToken) {
		riseToken = new RiseToken(event.transaction.hash.toHex());
	}
	riseToken.save();
}

export function handleRiseTokenMinted(event: RiseTokenMinted): void {
	let mint = Mint.load(event.transaction.hash.toHex());
	if (!mint) {
		mint = new Mint(event.transaction.hash.toHex());
	}
	mint.save();
}

export function handleRiseTokenBurned(event: RiseTokenBurned): void {
	let burn = Burn.load(event.transaction.hash.toHex());
	if (!burn) {
		burn = new Burn(event.transaction.hash.toHex());
	}
	burn.save();
}

export function handleRiseTokenRebalanced(event: RiseTokenRebalanced): void {
	let rebalance = Rebalance.load(event.transaction.hash.toHex());
	if (!rebalance) {
		rebalance = new Rebalance(event.transaction.hash.toHex());
	}
	rebalance.save();
}

export function handleSupplyAdded(event: SupplyAdded): void {
	let deposit = Deposit.load(event.transaction.hash.toHex());
	if (!deposit) {
		deposit = new Deposit(event.transaction.hash.toHex());
	}
	deposit.save();
}

export function handleSupplyRemoved(event: SupplyRemoved): void {
	let withdraw = Withdraw.load(event.transaction.hash.toHex());
	if (!withdraw) {
		withdraw = new Withdraw(event.transaction.hash.toHex());
	}
	withdraw.save();
}
