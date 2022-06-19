import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
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

	let burn = Burn.load(event.transaction.hash.toHex());
	if (burn == null) {
		burn = new Burn(event.transaction.hash.toHex());
		burn.transaction = transaction.id;
		burn.timestamp = event.block.timestamp;
		burn.token = event.params.riseToken.toHex();
		burn.sender = user.id;
	}
	burn.burnedAmount = convertEthToDecimal(event.params.redeemedAmount);
	burn.amountUSD = BigDecimal.fromString("0"); // Dummy
	burn.save();
}

export function handleRiseTokenRebalanced(event: RiseTokenRebalanced): void {
	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let rebalance = Rebalance.load(event.transaction.hash.toHex());
	if (rebalance == null) {
		rebalance = new Rebalance(event.transaction.hash.toHex());
		rebalance.transaction = transaction.id;
		rebalance.timestamp = event.block.timestamp;
		rebalance.token = "0x46D06cf8052eA6FdbF71736AF33eD23686eA1452"; // ETHRISE in Arbitrum
	}
	rebalance.executor = event.params.executor;
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
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
	}
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let deposit = Deposit.load(event.transaction.hash.toHex());
	if (deposit == null) {
		deposit = new Deposit(event.transaction.hash.toHex());
		deposit.transaction = transaction.id;
		deposit.timestamp = event.block.timestamp;
		deposit.tokenIn = Bytes.fromHexString(
			"0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
		); // USDC in arbitrum
		deposit.sender = user.id;
	}
	deposit.mintedAmount = convertEthToDecimal(event.params.mintedAmount);
	deposit.amountUSD = BigDecimal.fromString("0"); // Dummy
	deposit.save();
}

export function handleSupplyRemoved(event: SupplyRemoved): void {
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
	}
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let withdraw = Withdraw.load(event.transaction.hash.toHex());
	if (withdraw == null) {
		withdraw = new Withdraw(event.transaction.hash.toHex());
		withdraw.transaction = transaction.id;
		withdraw.timestamp = event.block.timestamp;
		withdraw.tokenOut = Bytes.fromHexString(
			"0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
		); // USDC in arbitrum
		withdraw.sender = user.id;
	}
	withdraw.rvTokenAmount = convertEthToDecimal(event.params.amount);
	withdraw.exchangeRate = convertEthToDecimal(
		event.params.ExchangeRateInEther
	);
	withdraw.tokenOutAmount = convertEthToDecimal(event.params.redeemedAmount);
	withdraw.amountUSD = BigDecimal.fromString("0"); // Dummy
	withdraw.save();
}
