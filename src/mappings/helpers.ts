import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

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
