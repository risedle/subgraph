import {
	RiseTokenVault,
	Approval,
	FeeCollected,
	FeeRecipientUpdated,
	InterestAccrued,
	MaxTotalCollateralUpdated,
	OracleContractUpdated,
	OwnershipTransferred,
	ParametersUpdated,
	RiseTokenBurned,
	RiseTokenCreated,
	RiseTokenMinted,
	RiseTokenRebalanced,
	SupplyAdded,
	SupplyRemoved,
	SwapContractUpdated,
	Transfer,
} from "../generated/RiseTokenVault/RiseTokenVault";
import { MintEntity, RedeemEntity, RevenueEntity } from "../generated/schema";

export function handleApproval(event: Approval): void {}

export function handleFeeCollected(event: FeeCollected): void {
	/** @var id */
	let revenueEntity = RevenueEntity.load(event.transaction.hash.toHex());
	if (!revenueEntity) {
		revenueEntity = new RevenueEntity(event.transaction.hash.toHex());
	}

	/** @var collector */
	revenueEntity.collector = event.params.collector;

	/** @var amount */
	revenueEntity.amount = event.params.total;

	/** @var recipient */
	revenueEntity.recipient = event.params.feeRecipient;

	/** @var timestamp */
	revenueEntity.timestamp = event.block.timestamp;
}

export function handleFeeRecipientUpdated(event: FeeRecipientUpdated): void {}

export function handleInterestAccrued(event: InterestAccrued): void {}

export function handleMaxTotalCollateralUpdated(
	event: MaxTotalCollateralUpdated
): void {}

export function handleOracleContractUpdated(
	event: OracleContractUpdated
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleParametersUpdated(event: ParametersUpdated): void {}

export function handleRiseTokenBurned(event: RiseTokenBurned): void {
	/** @var id */
	let redeemEntity = RedeemEntity.load(event.transaction.hash.toHex());
	if (!redeemEntity) {
		redeemEntity = new RedeemEntity(event.transaction.hash.toHex());
	}

	/** @var user */
	redeemEntity.user = event.params.user;

	/** @var riseToken */
	redeemEntity.riseToken = event.params.riseToken;
	// let x = event.receipt.logs

	/** @var amountETH */
	redeemEntity.amountETH = event.params.redeemedAmount;

	/** @var amountRISE */

	redeemEntity.inputFunction = event.transaction.input;

	/** @var timestamp */
	redeemEntity.timestamp = event.block.timestamp;

	redeemEntity.save();
}

export function handleRiseTokenCreated(event: RiseTokenCreated): void {}

export function handleRiseTokenMinted(event: RiseTokenMinted): void {
	/** @var id */
	let mintEntity = MintEntity.load(event.transaction.hash.toHex());
	if (!mintEntity) {
		mintEntity = new MintEntity(event.transaction.hash.toHex());
	}

	/** @var user */
	mintEntity.user = event.params.user;

	/** @var riseToken */
	mintEntity.riseToken = event.params.riseToken;

	/** @var amountETH */
	mintEntity.amountETH = event.transaction.value;

	/** @var amountRISE */
	mintEntity.amountRISE = event.params.mintedAmount;

	/** @var timestamp */
	mintEntity.timestamp = event.block.timestamp;

	mintEntity.save();
}

export function handleRiseTokenRebalanced(event: RiseTokenRebalanced): void {}

export function handleSupplyAdded(event: SupplyAdded): void {}

export function handleSupplyRemoved(event: SupplyRemoved): void {}

export function handleSwapContractUpdated(event: SwapContractUpdated): void {}

export function handleTransfer(event: Transfer): void {}
