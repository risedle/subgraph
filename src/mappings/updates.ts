import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { RiseTokenDayData, RiseTokenHourData } from "../types/schema";
import {
	ZERO_BD,
	ZERO_BI,
	convertEthToDecimal,
	convertUSDCToDecimal,
	oracleContract,
	ONE_BI,
} from "./helpers";

export function hourlyVolumeUpdate(
	event: ethereum.Event,
	amount: BigInt
): void {
	// hourly update
	const hourTimestamp = event.block.timestamp.div(BigInt.fromI32(3600));
	let riseTokenHourData = RiseTokenHourData.load(hourTimestamp.toString());
	if (riseTokenHourData == null) {
		riseTokenHourData = new RiseTokenHourData(hourTimestamp.toString());
		riseTokenHourData.date = hourTimestamp
			.times(BigInt.fromI32(3600))
			.toI32();
		riseTokenHourData.hourlyVolumeETH = ZERO_BD;
		riseTokenHourData.hourlyVolumeUSD = ZERO_BD;
		riseTokenHourData.hourlyFeeETH = ZERO_BD;
		riseTokenHourData.hourlyFeeUSD = ZERO_BD;

		riseTokenHourData.totalVolumeETH = ZERO_BD;
		riseTokenHourData.totalVolumeUSD = ZERO_BD;
		riseTokenHourData.totalAUMETH = ZERO_BD;
		riseTokenHourData.totalAUMUSD = ZERO_BD;

		riseTokenHourData.txCount = ZERO_BI;
	}

	riseTokenHourData.hourlyVolumeETH = riseTokenHourData.hourlyVolumeETH.plus(
		convertEthToDecimal(amount)
	);
	riseTokenHourData.hourlyVolumeUSD = riseTokenHourData.hourlyVolumeETH.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	riseTokenHourData.txCount = riseTokenHourData.txCount.plus(ONE_BI);
	riseTokenHourData.save();
}

export function dailyVolumeUpdate(event: ethereum.Event, amount: BigInt): void {
	// daily update
	const dayTimestamp = event.block.timestamp.div(BigInt.fromI32(86400));
	let riseTokenDayData = RiseTokenDayData.load(dayTimestamp.toString());
	if (riseTokenDayData == null) {
		riseTokenDayData = new RiseTokenDayData(dayTimestamp.toString());
		riseTokenDayData.date = dayTimestamp
			.times(BigInt.fromI32(86400))
			.toI32();
		riseTokenDayData.dailyVolumeETH = ZERO_BD;
		riseTokenDayData.dailyVolumeUSD = ZERO_BD;

		riseTokenDayData.totalVolumeETH = ZERO_BD;
		riseTokenDayData.totalVolumeUSD = ZERO_BD;
		riseTokenDayData.totalAUMETH = ZERO_BD;
		riseTokenDayData.totalAUMUSD = ZERO_BD;

		riseTokenDayData.txCount = ZERO_BI;
	}

	riseTokenDayData.dailyVolumeETH = riseTokenDayData.dailyVolumeETH.plus(
		convertEthToDecimal(amount)
	);
	riseTokenDayData.dailyVolumeUSD = riseTokenDayData.dailyVolumeETH.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	riseTokenDayData.txCount = riseTokenDayData.txCount.plus(ONE_BI);
	riseTokenDayData.save();
}
