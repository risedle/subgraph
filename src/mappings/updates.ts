/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
	DailyActiveUser,
	MonthlyActiveUser,
	RiseToken,
	RiseTokenDayData,
	RiseTokenHourData,
	User,
} from "../types/schema";
import {
	ZERO_BD,
	ZERO_BI,
	convertEthToDecimal,
	convertUSDCToDecimal,
	oracleContract,
	ONE_BI,
	vaultContract,
	getDailyId,
	getTimestampFromId,
	getMonthlyId,
	getHourlyId,
	getTimestampFromHourlyId,
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
		riseToken.tradeVolumeUSD = riseToken.tradeVolumeUSD.plus(
			convertEthToDecimal(amount).times(
				convertUSDCToDecimal(oracleContract.getPrice())
			)
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
	const hourTimestamp = getHourlyId(event.block.timestamp);
	let riseTokenHourData = RiseTokenHourData.load(hourTimestamp);
	if (riseTokenHourData == null) {
		riseTokenHourData = new RiseTokenHourData(hourTimestamp);
		riseTokenHourData.timestamp = getTimestampFromHourlyId(hourTimestamp);
		riseTokenHourData.hourlyVolumeETH = ZERO_BD;
		riseTokenHourData.hourlyVolumeUSD = ZERO_BD;
		riseTokenHourData.hourlyFeeETH = ZERO_BD;
		riseTokenHourData.hourlyFeeUSD = ZERO_BD;

		riseTokenHourData.totalPendingFees = ZERO_BD;

		riseTokenHourData.totalVolumeETH = ZERO_BD;
		riseTokenHourData.totalVolumeUSD = ZERO_BD;
		riseTokenHourData.totalAUMETH = ZERO_BD;
		riseTokenHourData.totalAUMUSD = ZERO_BD;

		riseTokenHourData.txCount = ZERO_BI;
	}

	riseTokenHourData.hourlyVolumeETH = riseTokenHourData.hourlyVolumeETH.plus(
		convertEthToDecimal(amount)
	);
	riseTokenHourData.hourlyVolumeUSD = riseTokenHourData.hourlyVolumeUSD.plus(
		convertEthToDecimal(amount).times(
			convertUSDCToDecimal(oracleContract.getPrice())
		)
	);

	let metadata = vaultContract.getMetadata(
		Address.fromString(riseTokenAddress)
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
		riseTokenHourData.totalPendingFees = convertEthToDecimal(
			metadata.totalPendingFees
		).plus(riseToken.totalFeeCollected);

		let prevTotalPendingFees = ZERO_BD;
		if (riseToken.lastHourData) {
			let prevRiseTokenHourData = RiseTokenHourData.load(
				riseToken.lastHourData + ""
			);
			if (prevRiseTokenHourData) {
				prevTotalPendingFees = prevRiseTokenHourData.totalPendingFees;
			}
		}

		riseTokenHourData.hourlyFeeETH = riseTokenHourData.totalPendingFees.minus(
			prevTotalPendingFees
		);
		riseTokenHourData.hourlyFeeUSD = riseTokenHourData.hourlyFeeETH.times(
			convertUSDCToDecimal(oracleContract.getPrice())
		);
		riseTokenHourData.save();
		
		riseToken.lastHourData = riseTokenHourData.id;
		riseToken.save();
	}
}

export function dailyVolumeUpdate(
	event: ethereum.Event,
	riseTokenAddress: string,
	amount: BigInt
): void {
	// daily update
	const dayTimestamp = getDailyId(event.block.timestamp);
	let riseTokenDayData = RiseTokenDayData.load(dayTimestamp);
	if (riseTokenDayData == null) {
		riseTokenDayData = new RiseTokenDayData(dayTimestamp);
		riseTokenDayData.timestamp = getTimestampFromId(dayTimestamp);
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
	riseTokenDayData.dailyVolumeUSD = riseTokenDayData.dailyVolumeUSD.plus(
		convertEthToDecimal(amount).times(
			convertUSDCToDecimal(oracleContract.getPrice())
		)
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

export function dailyActiveUsersUpdate(
	event: ethereum.Event,
	user: User
): void {
	let dayTimestamp = getDailyId(event.block.timestamp);
	let dau = DailyActiveUser.load(dayTimestamp);
	if (dau == null) {
		dau = new DailyActiveUser(dayTimestamp);
		dau.uniqueUsersCount = ONE_BI;
		dau.timestamp = getTimestampFromId(dayTimestamp);
		dau.users = [user.id];
		dau.save();
	} else {
		if (getDailyId(user.lastTransactionTimestamp) != dayTimestamp) {
			dau.uniqueUsersCount = dau.uniqueUsersCount.plus(ONE_BI);
			dau.users = dau.users.concat([user.id]);
			dau.timestamp = getTimestampFromId(dayTimestamp);
			dau.save();
		}
	}
}

export function monthlyActiveUsersUpdate(
	event: ethereum.Event,
	user: User
): void {
	let monthTimestamp = getMonthlyId(event.block.timestamp);
	let mau = MonthlyActiveUser.load(monthTimestamp);
	if (mau == null) {
		mau = new MonthlyActiveUser(monthTimestamp);
		mau.uniqueUsersCount = ONE_BI;
		mau.timestamp = getTimestampFromId(monthTimestamp);
		mau.users = [user.id];
		mau.save();
	} else {
		if (getMonthlyId(user.lastTransactionTimestamp) != monthTimestamp) {
			mau.uniqueUsersCount = mau.uniqueUsersCount.plus(ONE_BI);
			mau.users = mau.users.concat([user.id]);
			mau.timestamp = getTimestampFromId(monthTimestamp);
			mau.save();
		}
	}
}
