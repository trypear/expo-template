// MOCK DATA - Replace with TRPC query
import { formatCurrency } from "./formatCurrency";

// Transaction categories with icons
export const categories = [
	{ id: "cat_1", name: "Food & Dining", icon: "utensils", color: "#FF6B6B" },
	{ id: "cat_2", name: "Shopping", icon: "shopping-bag", color: "#4ECDC4" },
	{ id: "cat_3", name: "Transportation", icon: "car", color: "#FFD166" },
	{ id: "cat_4", name: "Entertainment", icon: "film", color: "#6A0572" },
	{ id: "cat_5", name: "Housing", icon: "home", color: "#1A535C" },
	{ id: "cat_6", name: "Utilities", icon: "bolt", color: "#3D5A80" },
	{ id: "cat_7", name: "Healthcare", icon: "heart", color: "#E76F51" },
	{ id: "cat_8", name: "Personal", icon: "user", color: "#8338EC" },
	{ id: "cat_9", name: "Education", icon: "graduation-cap", color: "#06D6A0" },
	{ id: "cat_10", name: "Income", icon: "wallet", color: "#2EC4B6" },
];

// Budget data
export const budgets = [
	{
		id: "budget_1",
		categoryId: "cat_1",
		amount: 500,
		spent: 320,
		period: "monthly",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get remaining() { return this.amount - this.spent },
		get percentUsed() { return (this.spent / this.amount) * 100 }
	},
	{
		id: "budget_2",
		categoryId: "cat_2",
		amount: 200,
		spent: 150,
		period: "monthly",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get remaining() { return this.amount - this.spent },
		get percentUsed() { return (this.spent / this.amount) * 100 }
	},
	{
		id: "budget_3",
		categoryId: "cat_3",
		amount: 300,
		spent: 275,
		period: "monthly",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get remaining() { return this.amount - this.spent },
		get percentUsed() { return (this.spent / this.amount) * 100 }
	},
	{
		id: "budget_4",
		categoryId: "cat_4",
		amount: 150,
		spent: 100,
		period: "monthly",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get remaining() { return this.amount - this.spent },
		get percentUsed() { return (this.spent / this.amount) * 100 }
	},
	{
		id: "budget_5",
		categoryId: "cat_5",
		amount: 1200,
		spent: 1200,
		period: "monthly",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get remaining() { return this.amount - this.spent },
		get percentUsed() { return (this.spent / this.amount) * 100 }
	},
];

// Transaction data
export const transactions = [
	{
		id: "tx_1",
		description: "Grocery Shopping",
		amount: -85.75,
		date: new Date(2025, 4, 5),
		categoryId: "cat_1",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_2",
		description: "Monthly Salary",
		amount: 3500,
		date: new Date(2025, 4, 1),
		categoryId: "cat_10",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_3",
		description: "Coffee Shop",
		amount: -4.50,
		date: new Date(2025, 4, 4),
		categoryId: "cat_1",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_4",
		description: "Movie Tickets",
		amount: -24.99,
		date: new Date(2025, 4, 3),
		categoryId: "cat_4",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_5",
		description: "Gas Station",
		amount: -45.00,
		date: new Date(2025, 4, 2),
		categoryId: "cat_3",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_6",
		description: "Rent Payment",
		amount: -1200,
		date: new Date(2025, 4, 1),
		categoryId: "cat_5",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_7",
		description: "Online Course",
		amount: -49.99,
		date: new Date(2025, 4, 2),
		categoryId: "cat_9",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
	{
		id: "tx_8",
		description: "New Shoes",
		amount: -89.99,
		date: new Date(2025, 4, 3),
		categoryId: "cat_2",
		get category() { return categories.find(c => c.id === this.categoryId)! },
		get formattedAmount() { return formatCurrency(this.amount) },
		get isExpense() { return this.amount < 0 }
	},
];

// Summary data
export const summary = {
	totalBalance: 5000.25,
	monthlyIncome: 3500,
	monthlyExpenses: 1500.22,
	savingsRate: 57.1, // percentage
};

// User preferences
export const userPreferences = {
	currency: "USD",
	startOfMonth: 1, // 1st day of month
	theme: "auto", // light, dark, auto
};

// Helper functions
export function getCategoryById(id: string) {
	return categories.find(category => category.id === id);
}

export function getBudgetById(id: string) {
	return budgets.find(budget => budget.id === id);
}

export function getTransactionById(id: string) {
	return transactions.find(transaction => transaction.id === id);
}

export function getRecentTransactions(count = 5) {
	return [...transactions]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, count);
}

export function getMonthlySpendingByCategory() {
	const spending = categories.map(category => {
		const total = transactions
			.filter(tx => tx.categoryId === category.id && tx.amount < 0)
			.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

		return {
			category,
			total,
		};
	});

	return spending.filter(item => item.total > 0).sort((a, b) => b.total - a.total);
}