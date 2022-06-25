/* eslint-disable prefer-const */
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
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
	DailyActiveUser,
	Deposit,
	Mint,
	Rebalance,
	RiseToken,
	Transaction,
	User,
	Withdraw,
} from "../types/schema";
import {
	convertEthToDecimal,
	convertUSDCToDecimal,
	fetchTokenDecimals,
	fetchTokenName,
	fetchTokenSymbol,
	fetchTokenTotalSupply,
	ONE_BI,
	oracleContract,
	tokenAddress,
	vaultContract,
	ZERO_BI,
} from "./helpers";
import { dailyVolumeUpdate, hourlyVolumeUpdate } from "./updates";

export function handleRiseTokenCreated(event: RiseTokenCreated): void {
	let riseToken = RiseToken.load(event.params.token.toHex());
	if (!riseToken) {
		riseToken = new RiseToken(event.params.token.toHex());
		riseToken.symbol = fetchTokenSymbol(event.params.token);
		riseToken.name = fetchTokenName(event.params.token);
		riseToken.decimals = fetchTokenDecimals(event.params.token);
		riseToken.totalSupply = fetchTokenTotalSupply(event.params.token);
		riseToken.tradeVolume = BigDecimal.fromString("0"); // Dummy
		riseToken.tradeVolumeUSD = BigDecimal.fromString("0"); // Dummy
		riseToken.txCount = BigInt.fromI32(0);
	}
	riseToken.save();
}

export function handleRiseTokenMinted(event: RiseTokenMinted): void {
	let user = User.load(event.params.user.toHex());
	if (user == null) {
		user = new User(event.params.user.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
	}
	user.save();

	let dayTimestamp = event.block.timestamp.div(BigInt.fromI32(86400));
	let dau = DailyActiveUser.load(dayTimestamp.toString());
	if (dau == null) {
		dau = new DailyActiveUser(dayTimestamp.toString());
		dau.uniqueUsersCount = ONE_BI;
		dau.timestamp = dayTimestamp.times(BigInt.fromI32(86400));
		dau.users = [user.id];
		dau.save();
	} else {
		if (
			user.lastTransactionTimestamp.div(BigInt.fromI32(86400)) !=
			dayTimestamp
		) {
			dau.uniqueUsersCount = dau.uniqueUsersCount.plus(ONE_BI);
			dau.users = dau.users.concat([user.id]);
			dau.timestamp = dayTimestamp.times(BigInt.fromI32(86400));
			dau.save();
		}
	}
	user.lastTransactionTimestamp = event.block.timestamp;
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
		mint.to = event.transaction.to;
		mint.sender = user.id;
	}
	mint.mintedAmount = convertEthToDecimal(event.params.mintedAmount);
	mint.amountUSD = BigDecimal.fromString("0"); // Dummy
	mint.save();

	// price update
	hourlyVolumeUpdate(event, event.transaction.value);
	dailyVolumeUpdate(event, event.transaction.value);
}

export function handleRiseTokenBurned(event: RiseTokenBurned): void {
	let user = User.load(event.params.user.toHex());
	if (user == null) {
		user = new User(event.params.user.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
	}
	user.save();

	let dayTimestamp = event.block.timestamp.div(BigInt.fromI32(86400));
	let dau = DailyActiveUser.load(dayTimestamp.toString());
	if (dau == null) {
		dau = new DailyActiveUser(dayTimestamp.toString());
		dau.uniqueUsersCount = ONE_BI;
		dau.timestamp = dayTimestamp.times(BigInt.fromI32(86400));
		dau.users = [user.id];
		dau.save();
	} else {
		if (
			user.lastTransactionTimestamp.div(BigInt.fromI32(86400)) !=
			dayTimestamp
		) {
			dau.uniqueUsersCount = dau.uniqueUsersCount.plus(ONE_BI);
			dau.users = dau.users.concat([user.id]);
			dau.timestamp = dayTimestamp.times(BigInt.fromI32(86400));
			dau.save();
		}
	}
	user.lastTransactionTimestamp = event.block.timestamp;
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
	burn.amountUSD = burn.burnedAmount.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	burn.save();

	// price update
	hourlyVolumeUpdate(event, event.params.redeemedAmount);
	dailyVolumeUpdate(event, event.params.redeemedAmount);
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
	rebalance.previousLeverageRatio = convertEthToDecimal(
		event.params.previousLeverageRatioInEther
	);
	rebalance.leverageRatio = convertEthToDecimal(
		vaultContract.getLeverageRatioInEther(tokenAddress)
	);
	rebalance.save();
}

export function handleSupplyAdded(event: SupplyAdded): void {
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
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
	deposit.amountUSD = deposit.mintedAmount.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	deposit.save();
}

export function handleSupplyRemoved(event: SupplyRemoved): void {
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
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
	withdraw.amountUSD = withdraw.tokenOutAmount.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	withdraw.save();
}
