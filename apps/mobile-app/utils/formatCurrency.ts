export function formatCurrency(amount: number): string {
	const absAmount = Math.abs(amount);

	if (absAmount >= 1000000) {
		return `$${(absAmount / 1000000).toFixed(1)}M`;
	}

	if (absAmount >= 1000) {
		return `$${(absAmount / 1000).toFixed(1)}k`;
	}

	return `$${absAmount.toFixed(2)}`;
}