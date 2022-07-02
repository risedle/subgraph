/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
	RiseToken,
	RiseTokenDayData,
	RiseTokenHourData,
} from "../types/schema";
import {
	ZERO_BD,
	ZERO_BI,
	convertEthToDecimal,
	convertUSDCToDecimal,
	oracleContract,
	ONE_BI,
	vaultContract,
} from "./helpers";

export function riseTokenUpdate(
	riseTokenAddress: string,
	amount: BigInt
): void {
	// Rise token update
	let riseToken = RiseToken.load(riseTokenAddress);
	if (riseToken) {
		riseToken.tradeVolume = riseToken.tradeVolume.plus(
			convertEthToDecimal(amount)
		);
		riseToken.tradeVolumeUSD = riseToken.tradeVolume.times(
			convertUSDCToDecimal(oracleContract.getPrice())
		);
		riseToken.totalSupply = vaultContract.totalSupply();
		riseToken.txCount = riseToken.txCount.plus(ONE_BI);
		riseToken.save();
	}
}

export function hourlyVolumeUpdate(
	event: ethereum.Event,
	riseTokenAddress: string,
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

	let metadata = vaultContract.getMetadata(
		Address.fromString(riseTokenAddress)
	);
	riseTokenHourData.hourlyFeeETH = convertEthToDecimal(
		metadata.totalPendingFees
	);
	riseTokenHourData.hourlyFeeUSD = riseTokenHourData.hourlyFeeETH.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);
	riseTokenHourData.totalAUMETH = convertEthToDecimal(
		metadata.totalCollateralPlusFee
	);
	riseTokenHourData.totalAUMUSD = riseTokenHourData.totalAUMETH.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);

	riseTokenHourData.txCount = riseTokenHourData.txCount.plus(ONE_BI);

	let riseToken = RiseToken.load(riseTokenAddress);
	if (riseToken) {
		riseTokenHourData.totalVolumeETH = riseToken.tradeVolume;
		riseTokenHourData.totalVolumeUSD = riseToken.tradeVolumeUSD;
		riseTokenHourData.save();
	}
}

export function dailyVolumeUpdate(
	event: ethereum.Event,
	riseTokenAddress: string,
	amount: BigInt
): void {
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

	let metadata = vaultContract.getMetadata(
		Address.fromString(riseTokenAddress)
	);
	riseTokenDayData.totalAUMETH = convertEthToDecimal(
		metadata.totalCollateralPlusFee
	);
	riseTokenDayData.totalAUMUSD = riseTokenDayData.totalAUMETH.times(
		convertUSDCToDecimal(oracleContract.getPrice())
	);

	riseTokenDayData.txCount = riseTokenDayData.txCount.plus(ONE_BI);

	let riseToken = RiseToken.load(riseTokenAddress);
	if (riseToken) {
		riseTokenDayData.totalVolumeETH = riseToken.tradeVolume;
		riseTokenDayData.totalVolumeUSD = riseToken.tradeVolumeUSD;
		riseTokenDayData.save();
	}
}
