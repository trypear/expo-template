import React from "react";
import { StyleSheet, View } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";

import { ThemedText } from "./ThemedText";

interface BudgetProgressBarProps {
  amount: number;
  spent: number;
  color: string;
  showLabels?: boolean;
}

export function BudgetProgressBar({
  amount,
  spent,
  color,
  showLabels = true,
}: BudgetProgressBarProps) {
  const percentUsed = Math.min((spent / amount) * 100, 100);
  const isOverBudget = spent > amount;

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labels}>
          <ThemedText style={styles.label}>
            {formatCurrency(spent)} spent
          </ThemedText>
          <ThemedText style={styles.label}>
            {formatCurrency(amount - spent)} left
          </ThemedText>
        </View>
      )}

      <View style={styles.barContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentUsed}%`,
              backgroundColor: isOverBudget ? "#FF6B6B" : color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 4,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
  },
  barContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});
