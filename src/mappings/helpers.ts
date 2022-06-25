import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../types/RiseTokenVault/ERC20";
import { ERC20NameBytes } from "../types/RiseTokenVault/ERC20NameBytes";
import { ERC20SymbolBytes } from "../types/RiseTokenVault/ERC20SymbolBytes";

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

export function isNullEthValue(value: string): boolean {
	return (
		value ==
		"0x0000000000000000000000000000000000000000000000000000000000000001"
	);
}

export function fetchTokenSymbol(tokenAddress: Address): string {
	const contract = ERC20.bind(tokenAddress);
	const contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

	// try types string and bytes32 for symbol
	let symbolValue = "unknown";
	const symbolResult = contract.try_symbol();
	if (symbolResult.reverted) {
		const symbolResultBytes = contractSymbolBytes.try_symbol();
		if (!symbolResultBytes.reverted) {
			// for broken pairs that have no symbol function exposed
			if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
				symbolValue = symbolResultBytes.value.toString();
			}
		}
	} else {
		symbolValue = symbolResult.value;
	}

	return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
	const contract = ERC20.bind(tokenAddress);
	const contractNameBytes = ERC20NameBytes.bind(tokenAddress);

	// try types string and bytes32 for name
	let nameValue = "unknown";
	const nameResult = contract.try_name();
	if (nameResult.reverted) {
		const nameResultBytes = contractNameBytes.try_name();
		if (!nameResultBytes.reverted) {
			// for broken exchanges that have no name function exposed
			if (!isNullEthValue(nameResultBytes.value.toHexString())) {
				nameValue = nameResultBytes.value.toString();
			}
		}
	} else {
		nameValue = nameResult.value;
	}

	return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
	const contract = ERC20.bind(tokenAddress);
	const totalSupplyResult = contract.try_totalSupply();
	return totalSupplyResult.value;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
	const contract = ERC20.bind(tokenAddress);
	const decimalResult = contract.try_decimals();
	return BigInt.fromI32(decimalResult.value);
}
