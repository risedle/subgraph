/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
	FeeCollected,
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
import {
	ADDRESS_ZERO,
	convertEthToDecimal,
	convertUSDCToDecimal,
	fetchTokenDecimals,
	fetchTokenName,
	fetchTokenSymbol,
	fetchTokenTotalSupply,
	oracleContract,
	tokenAddress,
	vaultContract,
	ZERO_BD,
	ZERO_BI,
} from "./helpers";
import {
	dailyActiveUsersUpdate,
	dailyVolumeUpdate,
	hourlyVolumeUpdate,
	monthlyActiveUsersUpdate,
	riseTokenUpdate,
} from "./updates";

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
		riseToken.lastRebalance = ADDRESS_ZERO;
		riseToken.lastHourData = ADDRESS_ZERO;

		riseToken.totalFeeCollected = ZERO_BD;
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

	dailyActiveUsersUpdate(event, user);
	monthlyActiveUsersUpdate(event, user);
	user.lastTransactionTimestamp = event.block.timestamp;
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let mint = new Mint(
		event.transaction.hash
			.toHex()
			.concat("-")
			.concat(event.logIndex.toString())
	);
	mint.transaction = transaction.id;
	mint.timestamp = event.block.timestamp;
	mint.token = event.params.riseToken.toHex();
	mint.to = event.transaction.to;
	mint.sender = user.id;
	mint.mintedAmount = convertEthToDecimal(event.params.mintedAmount);
	mint.amountUSD = convertEthToDecimal(event.transaction.value).times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	mint.save();

	// Rise token update
	riseTokenUpdate(event.params.riseToken.toHex(), event.transaction.value);

	// price update
	hourlyVolumeUpdate(
		event,
		event.params.riseToken.toHex(),
		event.transaction.value
	);
	dailyVolumeUpdate(
		event,
		event.params.riseToken.toHex(),
		event.transaction.value
	);
}

export function handleRiseTokenBurned(event: RiseTokenBurned): void {
	let user = User.load(event.params.user.toHex());
	if (user == null) {
		user = new User(event.params.user.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
	}
	user.save();

	dailyActiveUsersUpdate(event, user);
	monthlyActiveUsersUpdate(event, user);
	user.lastTransactionTimestamp = event.block.timestamp;
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let burn = new Burn(
		event.transaction.hash
			.toHex()
			.concat("-")
			.concat(event.logIndex.toString())
	);
	burn.transaction = transaction.id;
	burn.timestamp = event.block.timestamp;
	burn.token = event.params.riseToken.toHex();
	burn.sender = user.id;

	burn.ethAmount = convertEthToDecimal(event.params.redeemedAmount);
	burn.amountUSD = burn.ethAmount.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	burn.save();

	// Rise token update
	riseTokenUpdate(
		event.params.riseToken.toHex(),
		event.params.redeemedAmount
	);

	// price update
	hourlyVolumeUpdate(
		event,
		event.params.riseToken.toHex(),
		event.params.redeemedAmount
	);
	dailyVolumeUpdate(
		event,
		event.params.riseToken.toHex(),
		event.params.redeemedAmount
	);
}

export function handleRiseTokenRebalanced(event: RiseTokenRebalanced): void {
	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let rebalance = new Rebalance(
		event.transaction.hash
			.toHex()
			.concat("-")
			.concat(event.logIndex.toString())
	);
	rebalance.transaction = transaction.id;
	rebalance.timestamp = event.block.timestamp;
	rebalance.token = Address.fromString(
		"0x46D06cf8052eA6FdbF71736AF33eD23686eA1452"
	).toHex(); // ETHRISE in Arbitrum

	rebalance.executor = event.params.executor;
	rebalance.previousLeverageRatio = convertEthToDecimal(
		event.params.previousLeverageRatioInEther
	);
	rebalance.leverageRatio = convertEthToDecimal(
		vaultContract.getLeverageRatioInEther(tokenAddress)
	);

	let metadata = vaultContract.getMetadata(
		Address.fromString(rebalance.token)
	);
	rebalance.totalCollateral = convertEthToDecimal(
		metadata.totalCollateralPlusFee.minus(metadata.totalPendingFees)
	);
	rebalance.totalDebt = convertUSDCToDecimal(
		vaultContract.getOutstandingDebt(Address.fromString(rebalance.token))
	);

	let riseToken = RiseToken.load(rebalance.token);
	if (riseToken) {
		if (riseToken.lastRebalance) {
			let prevRebalance = Rebalance.load(riseToken.lastRebalance + "");
			if (prevRebalance) {
				rebalance.previousTotalCollateral =
					prevRebalance.totalCollateral;
				rebalance.previousTotalDebt = prevRebalance.totalDebt;
			}
		}
		riseToken.lastRebalance = rebalance.id;
		riseToken.save();
	}

	rebalance.save();
}

export function handleSupplyAdded(event: SupplyAdded): void {
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
	}
	user.save();

	dailyActiveUsersUpdate(event, user);
	monthlyActiveUsersUpdate(event, user);
	user.lastTransactionTimestamp = event.block.timestamp;
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let deposit = new Deposit(
		event.transaction.hash
			.toHex()
			.concat("-")
			.concat(event.logIndex.toString())
	);
	deposit.transaction = transaction.id;
	deposit.timestamp = event.block.timestamp;
	deposit.tokenIn = Bytes.fromHexString(
		"0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
	); // USDC in arbitrum
	deposit.sender = user.id;

	deposit.mintedAmount = convertEthToDecimal(event.params.mintedAmount);
	deposit.amountUSD = convertUSDCToDecimal(event.params.amount);
	deposit.save();
}

export function handleSupplyRemoved(event: SupplyRemoved): void {
	let user = User.load(event.params.account.toHex());
	if (user == null) {
		user = new User(event.params.account.toHex());
		user.lastTransactionTimestamp = ZERO_BI;
	}
	user.save();

	dailyActiveUsersUpdate(event, user);
	monthlyActiveUsersUpdate(event, user);
	user.lastTransactionTimestamp = event.block.timestamp;
	user.save();

	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.timestamp = event.block.timestamp;
		transaction.blockNumber = event.block.number;
	}
	transaction.save();

	let withdraw = new Withdraw(
		event.transaction.hash
			.toHex()
			.concat("-")
			.concat(event.logIndex.toString())
	);
	withdraw.transaction = transaction.id;
	withdraw.timestamp = event.block.timestamp;
	withdraw.tokenOut = Bytes.fromHexString(
		"0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
	); // USDC in arbitrum
	withdraw.sender = user.id;

	withdraw.rvTokenAmount = convertEthToDecimal(event.params.amount);
	withdraw.exchangeRate = convertEthToDecimal(
		event.params.ExchangeRateInEther
	);
	withdraw.tokenOutAmount = convertUSDCToDecimal(event.params.redeemedAmount);
	withdraw.amountUSD = withdraw.tokenOutAmount;
	withdraw.save();
}

export function handleFeeCollected(event: FeeCollected): void {
	let riseToken = RiseToken.load(
		Address.fromString("0x46D06cf8052eA6FdbF71736AF33eD23686eA1452").toHex()
	);
	if (riseToken) {
		// check if function is "collectPendingFees(address)"
		let selectorId = Bytes.fromUint8Array(
			event.transaction.input.slice(0, 4)
		);
		if (selectorId == Bytes.fromHexString("0x11ebf36d")) {
			riseToken.totalFeeCollected = riseToken.totalFeeCollected.plus(
				convertEthToDecimal(event.params.total)
			);
		}
	}
}
