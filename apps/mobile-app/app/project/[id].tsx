"use client";

import { Image, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
// @ts-expect-error Image import
import headerLogo from "@/assets/images/partial-react-logo.png";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useQuery } from "@tanstack/react-query";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const projectId = typeof id === "string" ? id : id?.[0];

  const { data: project } = useQuery(
    trpc.budget.getProject.queryOptions({
      id: projectId ?? "_",
    }),
  );

  const { data: budgets } = useQuery(
    trpc.budget.getProjectBudgets.queryOptions({
      projectId: projectId ?? "_",
    }),
  );

  const { data: transactions } = useQuery(
    trpc.budget.getProjectTransactions.queryOptions({
      projectId: projectId ?? "_",
    }),
  );

  if (!projectId) {
    router.back();
    return null;
  }

  const projectData = project?.[0];

  if (!projectData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Project not found</ThemedText>
      </ThemedView>
    );
  }

  const totalBudget =
    budgets?.reduce((sum, item) => sum + Number(item.budget.amount), 0) ?? 0;

  const netTransactions =
    transactions?.reduce((sum, item) => {
      const amount = Number(item.transaction.amount);
      return sum + (item.transaction.type === "INCOMING" ? amount : -amount);
    }, 0) ?? 0;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={headerLogo} style={styles.headerImage} />}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">{projectData.name}</ThemedText>
        {projectData.description && (
          <ThemedText style={styles.description}>
            {projectData.description}
          </ThemedText>
        )}

        <ThemedView
          style={styles.summary}
          lightColor={Colors.light.cardBackground}
          darkColor={Colors.dark.cardBackground}
        >
          <View style={styles.summaryItem}>
            <ThemedText
              style={styles.summaryLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              Total Budget
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              ${totalBudget.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText
              style={styles.summaryLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              Net Transactions
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={netTransactions >= 0 ? styles.positive : styles.negative}
              lightColor={
                netTransactions >= 0
                  ? Colors.light.positive
                  : Colors.light.negative
              }
              darkColor={
                netTransactions >= 0
                  ? Colors.dark.positive
                  : Colors.dark.negative
              }
            >
              ${Math.abs(netTransactions).toFixed(2)}
              {netTransactions >= 0 ? " +" : " -"}
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Budgets</ThemedText>
            <Button
              onPress={() => router.push(`/project/${projectId}/budget/new`)}
            >
              New Budget
            </Button>
          </View>
          {!budgets?.length ? (
            <ThemedView
              style={styles.emptyState}
              lightColor={Colors.light.cardBackground}
              darkColor={Colors.dark.cardBackground}
            >
              <ThemedText>No budgets yet</ThemedText>
              <ThemedText
                style={styles.emptyStateHint}
                lightColor={Colors.light.secondaryText}
                darkColor={Colors.dark.secondaryText}
              >
                Create a budget to start tracking your expenses
              </ThemedText>
            </ThemedView>
          ) : (
            budgets.map((item) => (
              <ThemedView
                key={item.budget.id}
                style={styles.card}
                lightColor={Colors.light.cardBackground}
                darkColor={Colors.dark.cardBackground}
              >
                <ThemedText type="defaultSemiBold">
                  {item.budget.name}
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  Amount: ${Number(item.budget.amount).toFixed(2)}
                </ThemedText>
                <ThemedText
                  lightColor={Colors.light.secondaryText}
                  darkColor={Colors.dark.secondaryText}
                >
                  Start: {new Date(item.budget.startDate).toLocaleDateString()}
                </ThemedText>
                {item.budget.endDate && (
                  <ThemedText
                    lightColor={Colors.light.secondaryText}
                    darkColor={Colors.dark.secondaryText}
                  >
                    End: {new Date(item.budget.endDate).toLocaleDateString()}
                  </ThemedText>
                )}
              </ThemedView>
            ))
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Transactions</ThemedText>
            <Button
              onPress={() =>
                router.push(`/project/${projectId}/transaction/new`)
              }
            >
              New Transaction
            </Button>
          </View>
          {!transactions?.length ? (
            <ThemedView
              style={styles.emptyState}
              lightColor={Colors.light.cardBackground}
              darkColor={Colors.dark.cardBackground}
            >
              <ThemedText>No transactions yet</ThemedText>
              <ThemedText
                style={styles.emptyStateHint}
                lightColor={Colors.light.secondaryText}
                darkColor={Colors.dark.secondaryText}
              >
                Add income or expenses to track your spending
              </ThemedText>
            </ThemedView>
          ) : (
            transactions.map((item) => (
              <ThemedView
                key={item.transaction.id}
                style={styles.card}
                lightColor={Colors.light.cardBackground}
                darkColor={Colors.dark.cardBackground}
              >
                <View style={styles.transactionHeader}>
                  <ThemedText type="defaultSemiBold">
                    ${Number(item.transaction.amount).toFixed(2)}
                  </ThemedText>
                  <ThemedView
                    style={styles.transactionType}
                    lightColor={
                      item.transaction.type === "INCOMING"
                        ? Colors.light.positive
                        : Colors.light.negative
                    }
                    darkColor={
                      item.transaction.type === "INCOMING"
                        ? Colors.dark.positive
                        : Colors.dark.negative
                    }
                  >
                    <ThemedText
                      style={styles.transactionTypeText}
                      lightColor="#FFFFFF"
                      darkColor="#FFFFFF"
                    >
                      {item.transaction.type}
                    </ThemedText>
                  </ThemedView>
                </View>
                <ThemedText
                  lightColor={Colors.light.secondaryText}
                  darkColor={Colors.dark.secondaryText}
                >
                  Date: {new Date(item.transaction.date).toLocaleDateString()}
                </ThemedText>
                {item.transaction.description && (
                  <ThemedText
                    lightColor={Colors.light.secondaryText}
                    darkColor={Colors.dark.secondaryText}
                  >
                    {item.transaction.description}
                  </ThemedText>
                )}
              </ThemedView>
            ))
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  description: {
    marginTop: 8,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  transactionTypeText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  positive: {},
  negative: {},
  emptyState: {
    padding: 24,
    alignItems: "center",
    borderRadius: 8,
  },
  emptyStateHint: {
    fontSize: 12,
    marginTop: 4,
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
