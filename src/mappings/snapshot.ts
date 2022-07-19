import { Address, BigInt } from "@graphprotocol/graph-ts";
import { AnswerUpdated } from "../types/AccessControlledOffchainAggregator/AccessControlledOffchainAggregator";
import { HourlyPriceData } from "../types/schema";
import {
	convertUSDCToDecimal,
	getHourlyId,
	getTimestampFromHourlyId,
	vaultContract,
	ZERO_BD,
} from "./helpers";

export function handleAnswerUpdated(event: AnswerUpdated): void {
	const hourTimestamp = getHourlyId(event.block.timestamp);
	let priceData = HourlyPriceData.load(hourTimestamp);
	if (priceData == null) {
		priceData = new HourlyPriceData(hourTimestamp);
		priceData.ethPrice = ZERO_BD;
		priceData.ethrisePrice = ZERO_BD;
	}
	priceData.timestamp = getTimestampFromHourlyId(hourTimestamp);
	priceData.ethPrice = event.params.current
		.toBigDecimal()
		.div(BigInt.fromI64(10 ** 8).toBigDecimal());
	priceData.ethrisePrice = convertUSDCToDecimal(
		vaultContract.getNAV(
			Address.fromString("0x46D06cf8052eA6FdbF71736AF33eD23686eA1452")
		)
	);
	if (priceData.ethrisePrice != ZERO_BD) priceData.save();
}
