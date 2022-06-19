import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
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
	Transaction,
	User,
	Withdraw,
} from "../types/schema";
import { convertEthToDecimal } from "./helpers";

export function handleRiseTokenCreated(event: RiseTokenCreated): void {
	let riseToken = RiseToken.load(event.params.token.toHex());
	if (!riseToken) {
		riseToken = new RiseToken(event.params.token.toHex());
		// Dummy Data
		riseToken.symbol = "<symbol>";
		riseToken.name = "<name>";
		riseToken.decimals = BigInt.fromI32(0);
		riseToken.totalSupply = BigInt.fromI32(0);
		riseToken.tradeVolume = BigDecimal.fromString("0");
		riseToken.tradeVolumeUSD = BigDecimal.fromString("0");
		riseToken.txCount = BigInt.fromI32(0);
	}
	riseToken.save();
}

export function handleRiseTokenMinted(event: RiseTokenMinted): void {
	let user = User.load(event.params.user.toHex());
	if (user == null) {
		user = new User(event.params.user.toHex());
	}
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let mint = Mint.load(event.transaction.hash.toHex());
	if (mint == null) {
		mint = new Mint(event.transaction.hash.toHex());
		mint.transaction = transaction.id;
		mint.timestamp = event.block.timestamp;
		mint.token = event.params.riseToken.toHex();
		mint.to = event.transaction.to ?? Address.fromI32(0);
		mint.sender = user.id;
	}
	mint.mintedAmount = convertEthToDecimal(event.params.mintedAmount);
	mint.amountUSD = BigDecimal.fromString("0"); // Dummy
	mint.save();
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
