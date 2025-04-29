"use client";

import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
}
export function ProjectCard({ id, name, description }: ProjectCardProps) {
  const { data: budgets } = useQuery(
    trpc.budget.getProjectBudgets.queryOptions({ projectId: id }),
  );

  const { data: transactions } = useQuery(
    trpc.budget.getProjectTransactions.queryOptions({ projectId: id }),
  );

  const totalBudget =
    budgets?.reduce((sum, item) => sum + Number(item.budget.amount), 0) ?? 0;

  const netTransactions =
    transactions?.reduce((sum, item) => {
      const amount = Number(item.transaction.amount);
      return sum + (item.transaction.type === "INCOMING" ? amount : -amount);
    }, 0) ?? 0;

  return (
    <Pressable onPress={() => router.push(`/project/${id}` as const)}>
      <ThemedView
        style={styles.card}
        lightColor={Colors.light.cardBackground}
        darkColor={Colors.dark.cardBackground}
      >
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {name}
          </ThemedText>
          <ThemedText
            style={[
              styles.balance,
              netTransactions >= 0 ? styles.positive : styles.negative,
            ]}
            lightColor={
              netTransactions >= 0
                ? Colors.light.positive
                : Colors.light.negative
            }
            darkColor={
              netTransactions >= 0 ? Colors.dark.positive : Colors.dark.negative
            }
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatCurrency(Math.abs(netTransactions))}
            {netTransactions >= 0 ? " +" : " -"}
          </ThemedText>
        </View>
        {description && (
          <ThemedText
            style={styles.description}
            lightColor={Colors.light.secondaryText}
            darkColor={Colors.dark.secondaryText}
          >
            {description}
          </ThemedText>
        )}
        <View
          style={[
            styles.stats,
            {
              borderTopColor: useThemeColor(
                {
                  light: Colors.light.cardBorder,
                  dark: Colors.dark.cardBorder,
                },
                "cardBorder",
              ),
            },
          ]}
        >
          <View>
            <ThemedText
              style={styles.statsLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              Budget: {formatCurrency(totalBudget)}
            </ThemedText>
            <ThemedText
              style={[
                styles.budgetStatus,
                Math.abs(netTransactions) > totalBudget
                  ? styles.overBudget
                  : styles.withinBudget,
              ]}
              lightColor={
                Math.abs(netTransactions) > totalBudget
                  ? Colors.light.negative
                  : Colors.light.positive
              }
              darkColor={
                Math.abs(netTransactions) > totalBudget
                  ? Colors.dark.negative
                  : Colors.dark.positive
              }
            >
              {totalBudget > 0
                ? `${((Math.abs(netTransactions) / totalBudget) * 100).toFixed(1)}% used`
                : "No budget set"}
            </ThemedText>
          </View>
          <View>
            <ThemedText
              style={styles.statsLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              {transactions?.length ?? 0} transactions
            </ThemedText>
            <ThemedText
              style={styles.statsLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              {formatCurrency(Math.abs(netTransactions))} spent
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.cardBorder,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    marginTop: 8,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statsLabel: {
    fontSize: 10,
  },
  balance: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  budgetStatus: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  overBudget: {},
  withinBudget: {},
  positive: {},
  negative: {},
});
