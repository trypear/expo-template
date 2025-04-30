"use client";

import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

const MONTH_NAMES = [
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

interface MonthlyTotal {
  income: number;
  expense: number;
}

interface DateParts {
  month: number;
  year: number;
}

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  backgroundColor: string;
}

const parseDateString = (dateStr: string): DateParts => {
  const [monthStr = "1", yearStr = "2000"] = dateStr.split("/");
  return {
    month: parseInt(monthStr, 10),
    year: parseInt(yearStr, 10),
  };
};

const SummaryCard = ({
  label,
  value,
  color,
  backgroundColor,
}: SummaryCardProps) => (
  <View style={[styles.summaryCard, { backgroundColor }]}>
    <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
    <ThemedText type="title" style={{ color }}>
      ${value.toFixed(2)}
    </ThemedText>
  </View>
);

const ChartContainer = ({
  title,
  children,
  colors,
  noData,
}: {
  title: string;
  children: React.ReactNode;
  colors: typeof Colors.light;
  noData?: boolean;
}) => (
  <View
    style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}
  >
    <ThemedText type="subtitle" style={styles.chartTitle}>
      {title}
    </ThemedText>
    {noData && (
      <ThemedText style={styles.noDataText}>
        No {title.toLowerCase()} data available
      </ThemedText>
    )}
    {children}
  </View>
);

const commonChartProps = (colors: typeof Colors.light) => ({
  height: 200,
  width: 350,
  spacing: 90,
  initialSpacing: 40,
  endSpacing: 40,
  xAxisColor: colors.chartGrid,
  yAxisColor: colors.chartGrid,
  yAxisTextStyle: { color: colors.text },
  xAxisLabelTextStyle: {
    color: colors.text,
    width: 90,
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
  yAxisThickness: 1,
  xAxisThickness: 1,
  noOfSections: 5,
});

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { data: projects } = useQuery(trpc.budget.getProjects.queryOptions());
  const projectId = projects?.[0]?.id;

  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }, []);

  const { data: transactions } = useQuery(
    trpc.budget.getProjectTransactions.queryOptions({
      projectId: projectId ?? "",
      startDate,
    }),
  );

  const totalBudget = useMemo(() => {
    return projects?.reduce((acc, curr) => {
      return acc + Number(curr.budget);
    }, 0);
  }, [projects]);

  const lineData = useMemo(() => {
    if (!transactions?.length) {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      return [
        {
          value: 0,
          label: `${MONTH_NAMES[month]}\n${year}`,
          frontColor: colors.secondaryText,
        },
        {
          value: 0,
          label: `${MONTH_NAMES[(month + 1) % 12]}\n${year}`,
          frontColor: colors.secondaryText,
        },
      ];
    }

    const monthlyTotals: Record<string, MonthlyTotal> = {};

    transactions.forEach((t) => {
      const date = new Date(t.transaction.date);
      const monthYear = `${MONTH_NAMES[date.getMonth()]}\n${date.getFullYear()}`;
      monthlyTotals[monthYear] ??= { income: 0, expense: 0 };
      const amount = Number(t.transaction.amount);
      if (Number(t.transaction.amount) <= 0) {
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

  const { totalIncome, totalExpense } = useMemo(() => {
    if (!transactions?.length) return { totalIncome: 0, totalExpense: 0 };

    return transactions.reduce(
      (acc, t) => {
        const amount = Number(t.transaction.amount);
        if (Number(t.transaction.amount) <= 0) {
          acc.totalExpense += amount;
        } else {
          acc.totalIncome += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
  }, [transactions]);

  if (!projects?.length || totalBudget === undefined) {
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

      <View style={styles.topSummaryContainer}>
        <SummaryCard
          label="Income"
          value={totalIncome}
          color={colors.incomeText}
          backgroundColor={colors.cardHighlight}
        />
        <SummaryCard
          label="Expenses"
          value={totalExpense}
          color={colors.expenseText}
          backgroundColor={colors.cardHighlight}
        />
        <SummaryCard
          label="Budget"
          value={totalBudget}
          color={colors.tint}
          backgroundColor={colors.cardHighlight}
        />
      </View>

      <ChartContainer
        title="Cash Flow"
        colors={colors}
        noData={!transactions?.length}
      >
        <LineChart
          {...commonChartProps(colors)}
          data={lineData}
          color={colors.chartLine}
          showVerticalLines
          verticalLinesColor={colors.chartGrid}
          rulesColor={colors.chartGrid}
          rulesType="solid"
          maxValue={Math.max(...lineData.map((d) => Math.abs(d.value))) || 10}
        />
      </ChartContainer>
    </ScrollView>
  );
}

const cardShadow = {
  shadowColor: Colors.light.cardShadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 3,
};

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
    ...cardShadow,
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
    ...cardShadow,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
});
