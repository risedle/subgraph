import { Bytes } from "@graphprotocol/graph-ts";
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
import {
	convertEthToDecimal,
	getRiseTokenByEvent,
	getTransactionByEvent,
	getUserByEvent,
} from "./helpers";

export function handleRiseTokenCreated(event: RiseTokenCreated): void {
	let riseToken = RiseToken.load(event.transaction.hash.toHex());
	if (!riseToken) {
		riseToken = new RiseToken(event.transaction.hash.toHex());
	}
	/** @var {RiseToken} */
	// riseToken.transaction;
	// riseToken.symbol;
	// riseToken.name;
	// riseToken.decimals;
	// riseToken.totalSupply;
	// riseToken.tradeVolume;
	// riseToken.tradeVolumeUSD;
	// riseToken.txCount;
	riseToken.save();
}

export function handleRiseTokenMinted(event: RiseTokenMinted): void {
	const tx = getTransactionByEvent(event);
	const user = getUserByEvent(event);
	const riseToken = getRiseTokenByEvent(event);

	riseToken.save();

	const mint = new Mint(tx.id);
	mint.transaction = tx.id;
	mint.timestamp = tx.timestamp;
	mint.token = riseToken.id;
	mint.to = Bytes.fromHexString(event.transaction.to?.toHexString() ?? "0");
	mint.sender = user.id;
	mint.mintedAmount = convertEthToDecimal(
		(event as RiseTokenMinted).params.mintedAmount
	);
	// mint.amountUSD; --> TODO: cari nav
	mint.save();

	tx.mints = tx.mints ? tx.mints.concat([mint.id]) : [];
	tx.save();

	user.mints = user.mints ? user.mints.concat([mint.id]) : [];
	user.save();
}

export function handleRiseTokenBurned(event: RiseTokenBurned): void {
	let burn = Burn.load(event.transaction.hash.toHex());
	if (!burn) {
		burn = new Burn(event.transaction.hash.toHex());
	}
	/** @var {Burn} */
	// burn.transaction;
	// burn.timestamp;
	// burn.token;
	// burn.sender;
	// burn.burnedAmount;
	// burn.amountUSD;
	burn.save();
}

export function handleRiseTokenRebalanced(event: RiseTokenRebalanced): void {
	let rebalance = Rebalance.load(event.transaction.hash.toHex());
	if (!rebalance) {
		rebalance = new Rebalance(event.transaction.hash.toHex());
	}
	/** @var {Rebalance} */
	// rebalance.transaction;
	// rebalance.timestamp;
	// rebalance.token;
	// rebalance.executor;
	// rebalance.burnedAmount;
	// rebalance.previousLeverageRatio;
	// rebalance.leverageRatio;
	// rebalance.previousTotalCollateral;
	// rebalance.totalCollateral;
	// rebalance.previousTotalDebt;
	// rebalance.totalDebt;
	// rebalance.totalRepayment;
	// rebalance.totalBorrow;
	rebalance.save();
}

export function handleSupplyAdded(event: SupplyAdded): void {
	let deposit = Deposit.load(event.transaction.hash.toHex());
	if (!deposit) {
		deposit = new Deposit(event.transaction.hash.toHex());
	}
	/** @var {Deposit} */
	// deposit.transaction;
	// deposit.timestamp;
	// deposit.tokenIn;
	// deposit.sender;
	// deposit.mintedAmount;
	// deposit.amountUSD;
	deposit.save();
}

export function handleSupplyRemoved(event: SupplyRemoved): void {
	let withdraw = Withdraw.load(event.transaction.hash.toHex());
	if (!withdraw) {
		withdraw = new Withdraw(event.transaction.hash.toHex());
	}
	/** @var {Withdraw} */
	// withdraw.transaction;
	// withdraw.timestamp;
	// withdraw.tokenOut;
	// withdraw.sender;
	// withdraw.rvTokenAmount;
	// withdraw.exchangeRate;
	// withdraw.tokenOutAmount;
	// withdraw.amountUSD;
	withdraw.save();
}
