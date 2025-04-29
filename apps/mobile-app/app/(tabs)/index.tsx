"use client";

import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

interface MonthlyTotal {
  income: number;
  expense: number;
}

interface DateParts {
  month: number;
  year: number;
}

const parseDateString = (dateStr: string): DateParts => {
  const [monthStr = "1", yearStr = "2000"] = dateStr.split("/");
  return {
    month: parseInt(monthStr, 10),
    year: parseInt(yearStr, 10),
  };
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Get all projects
  const { data: projects } = useQuery(trpc.budget.getProjects.queryOptions());
  const projectId = projects?.[0]?.id;

  // Memoize the start date to prevent refresh loops
  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }, []);

  // Get transactions for the first project
  const { data: transactions } = useQuery(
    trpc.budget.getProjectTransactions.queryOptions({
      projectId: projectId ?? "",
      startDate,
    }),
  );

  // Get budgets for the first project
  const { data: budgets } = useQuery(
    trpc.budget.getProjectBudgets.queryOptions({
      projectId: projectId ?? "",
    }),
  );

  // Process transaction data for line chart
  const lineData = useMemo(() => {
    if (!transactions?.length) {
      const now = new Date();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = now.getMonth();
      const year = now.getFullYear();
      return [
        {
          value: 0,
          label: `${monthNames[month]}\n${year}`,
          frontColor: colors.secondaryText,
        },
        {
          value: 0,
          label: `${monthNames[(month + 1) % 12]}\n${year}`,
          frontColor: colors.secondaryText,
        },
      ];
    }

    const monthlyTotals: Record<string, MonthlyTotal> = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    transactions.forEach((t) => {
      const date = new Date(t.transaction.date);
      const monthYear = `${monthNames[date.getMonth()]}\n${date.getFullYear()}`;
      monthlyTotals[monthYear] ??= { income: 0, expense: 0 };
      const amount = Number(t.transaction.amount);
      if (t.transaction.type === "OUTGOING") {
        monthlyTotals[monthYear].expense += amount;
      } else {
        monthlyTotals[monthYear].income += amount;
      }
    });

    const sortedData = Object.entries(monthlyTotals)
      .sort(([dateA], [dateB]) => {
        const { month: monthA, year: yearA } = parseDateString(dateA);
        const { month: monthB, year: yearB } = parseDateString(dateB);
        return (
          new Date(yearA, monthA - 1).getTime() -
          new Date(yearB, monthB - 1).getTime()
        );
      })
      .map(([label, totals]) => ({
        value: totals.income - totals.expense,
        label,
        frontColor:
          totals.income > totals.expense
            ? colors.incomeText
            : colors.expenseText,
      }));

    if (sortedData.length === 1 && sortedData[0]) {
      const { month, year } = parseDateString(sortedData[0].label);
      sortedData.push({
        value: 0,
        label: `${month + 1}/${year}`,
        frontColor: colors.secondaryText,
      });
    }

    return sortedData;
  }, [transactions, colors]);

  // Process budget data for bar chart
  const barData = useMemo(() => {
    if (!budgets?.length) {
      return [
        { value: 0, label: "No Budget", frontColor: colors.chartBarSecondary },
        { value: 0, label: "Set Budget", frontColor: colors.chartBarSecondary },
      ];
    }

    return budgets.map((b, index) => ({
      value: Number(b.budget.amount),
      label: b.budget.name,
      frontColor: index % 2 === 0 ? colors.chartBar : colors.chartBarSecondary,
    }));
  }, [budgets, colors]);

  // Calculate summary values
  const totalBudget = useMemo(
    () => (budgets ?? []).reduce((sum, b) => sum + Number(b.budget.amount), 0),
    [budgets],
  );

  const { totalIncome, totalExpense } = useMemo(() => {
    if (!transactions?.length) return { totalIncome: 0, totalExpense: 0 };

    return transactions.reduce(
      (acc, t) => {
        const amount = Number(t.transaction.amount);
        if (t.transaction.type === "OUTGOING") {
          acc.totalExpense += amount;
        } else {
          acc.totalIncome += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
  }, [transactions]);

  if (!projects?.length) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Budget Overview
        </ThemedText>
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">No projects yet</ThemedText>
          <ThemedText>
            Create a project to start tracking your budget!
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Budget Overview
      </ThemedText>

      {/* Top Summary Cards */}
      <View style={styles.topSummaryContainer}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.cardHighlight },
          ]}
        >
          <ThemedText style={styles.summaryLabel}>Income</ThemedText>
          <ThemedText type="title" style={{ color: colors.incomeText }}>
            ${totalIncome.toFixed(2)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.cardHighlight },
          ]}
        >
          <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
          <ThemedText type="title" style={{ color: colors.expenseText }}>
            ${totalExpense.toFixed(2)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.cardHighlight },
          ]}
        >
          <ThemedText style={styles.summaryLabel}>Budget</ThemedText>
          <ThemedText type="title" style={{ color: colors.tint }}>
            ${totalBudget.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* Cash Flow Chart */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <ThemedText type="subtitle" style={styles.chartTitle}>
          Cash Flow
        </ThemedText>
        {!transactions?.length && (
          <ThemedText style={styles.noDataText}>
            No transaction data available
          </ThemedText>
        )}
        <LineChart
          data={lineData}
          height={200}
          width={350}
          spacing={90}
          initialSpacing={40}
          endSpacing={40}
          color={colors.chartLine}
          textColor={colors.text}
          showVerticalLines
          verticalLinesColor={colors.chartGrid}
          xAxisColor={colors.chartGrid}
          yAxisColor={colors.chartGrid}
          yAxisTextStyle={{ color: colors.text }}
          xAxisLabelTextStyle={{
            color: colors.text,
            width: 90,
            textAlign: "center",
            fontSize: 12,
            marginTop: 8,
          }}
          rulesColor={colors.chartGrid}
          rulesType="solid"
          yAxisThickness={1}
          xAxisThickness={1}
          maxValue={Math.max(...lineData.map((d) => Math.abs(d.value))) || 10}
          noOfSections={5}
        />
      </View>

      {/* Budget Allocation Chart */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <ThemedText type="subtitle" style={styles.chartTitle}>
          Budget Allocation
        </ThemedText>
        {!budgets?.length && (
          <ThemedText style={styles.noDataText}>
            No budget data available
          </ThemedText>
        )}
        <BarChart
          data={barData}
          height={200}
          width={350}
          spacing={90}
          initialSpacing={40}
          endSpacing={40}
          barWidth={50}
          xAxisColor={colors.chartGrid}
          yAxisColor={colors.chartGrid}
          yAxisTextStyle={{ color: colors.text }}
          xAxisLabelTextStyle={{
            color: colors.text,
            width: 90,
            textAlign: "center",
            fontSize: 12,
            marginTop: 8,
          }}
          yAxisThickness={1}
          xAxisThickness={1}
          maxValue={Math.max(...barData.map((d) => d.value)) || 10}
          noOfSections={5}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginTop: 48,
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  topSummaryContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  chartContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    marginBottom: 16,
  },
  noDataText: {
    textAlign: "center",
    marginBottom: 8,
    color: Colors.light.secondaryText,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
});
