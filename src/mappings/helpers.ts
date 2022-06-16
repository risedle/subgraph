import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
	RiseTokenBurned,
	RiseTokenCreated,
	RiseTokenMinted,
} from "../types/RiseTokenVault/RiseTokenVault";
import { RiseToken, Transaction, User } from "../types/schema";

export function getTransactionByEvent(event: ethereum.Event): Transaction {
	let transaction = Transaction.load(event.transaction.hash.toHex());
	if (transaction === null) {
		transaction = new Transaction(event.transaction.hash.toHex());
		transaction.blockNumber = event.block.number;
		transaction.timestamp = event.block.timestamp;
		transaction.mints = [];
		transaction.redeems = [];
		transaction.deposits = [];
		transaction.withdrawals = [];
		transaction.rebalances = [];
	}
	return transaction;
}

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function getRiseTokenByEvent(
	event: RiseTokenCreated | RiseTokenMinted | RiseTokenBurned
): RiseToken {
	let tokenAddress = ADDRESS_ZERO;

	if (event instanceof RiseTokenCreated) {
		tokenAddress = event.params.token.toHex();
	}

	if (event instanceof RiseTokenMinted || event instanceof RiseTokenBurned) {
		tokenAddress = event.params.riseToken.toHex();
	}

	let riseToken = RiseToken.load(tokenAddress);
	if (riseToken === null) {
		riseToken = new RiseToken(tokenAddress);
		// riseToken.symbol;
		// riseToken.name;
		// riseToken.decimals;
		// riseToken.totalSupply;
		// riseToken.tradeVolume;
		// riseToken.tradeVolumeUSD;
		// riseToken.txCount;
	}
	return riseToken;
}

export function getUserByEvent(event: ethereum.Event): User {
	let user = User.load(event.transaction.from.toHex());
	if (user === null) {
		user = new User(event.transaction.from.toHex());
		user.mints = [];
		user.redeems = [];
		user.deposits = [];
		user.withdrawals = [];
	}
	return user;
}

const ZERO_BI = BigInt.fromI32(0);
const ONE_BI = BigInt.fromI32(1);
const BI_18 = BigInt.fromI32(18);

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
	let bd = BigDecimal.fromString("1");
	for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
		bd = bd.times(BigDecimal.fromString("10"));
	}
	return bd;
}

export function bigDecimalExp18(): BigDecimal {
	return BigDecimal.fromString("1000000000000000000");
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
	return eth.toBigDecimal().div(exponentToBigDecimal(BI_18));
}
