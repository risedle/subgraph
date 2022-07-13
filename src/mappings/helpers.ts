import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../types/RiseTokenVault/ERC20";
import { ERC20NameBytes } from "../types/RiseTokenVault/ERC20NameBytes";
import { ERC20SymbolBytes } from "../types/RiseTokenVault/ERC20SymbolBytes";
import { Oracle } from "../types/RiseTokenVault/Oracle";
import { RiseTokenVault } from "../types/RiseTokenVault/RiseTokenVault";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const BI_18 = BigInt.fromI32(18);
export const BI_6 = BigInt.fromI32(6);
export const ZERO_BD = BigDecimal.fromString("0");

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

export function convertUSDCToDecimal(usdc: BigInt): BigDecimal {
	return usdc.toBigDecimal().div(exponentToBigDecimal(BI_6));
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

export const vaultAddress = Address.fromString(
	"0xf7EDB240DbF7BBED7D321776AFe87D1FBcFD0A94"
);
export const tokenAddress = Address.fromString(
	"0x46D06cf8052eA6FdbF71736AF33eD23686eA1452"
);
export const oracleAddress = Address.fromString(
	"0x877bF15cAa17E4EE21236800D2D1a8dDA5B5251C"
);
export const vaultContract = RiseTokenVault.bind(vaultAddress);

export const oracleContract = Oracle.bind(oracleAddress);

// Date ISO String example --> 2022-01-28T18:22:31.000Z

export function getDailyId(timestamp: BigInt): string {
	const date = new Date(timestamp.toI64() * 1000);
	const array = date
		.toISOString()
		.split("T")[0]
		.split("-");
	const id = array[0]
		.concat("-")
		.concat(array[1])
		.concat("-")
		.concat(array[2]);
	return id;
}

export function getMonthlyId(timestamp: BigInt): string {
	const date = new Date(timestamp.toI64() * 1000);
	const array = date
		.toISOString()
		.split("T")[0]
		.split("-");
	const id = array[0].concat("-").concat(array[1]);
	return id;
}

export function getTimestampFromId(id: string): BigInt {
	const date = Date.parse(id);
	const timestamp: BigInt = BigInt.fromI64(date.getTime() / 1000);
	return timestamp;
}
