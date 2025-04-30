"use client";

import { useMemo } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useLocalSearchParams, useRouter } from "expo-router";
// @ts-expect-error Image import
import headerLogo from "@/assets/images/partial-react-logo.png";
import { LoadingScreen } from "@/components/LoadingScreen";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { platform } from "@/hooks/getPlatform";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assert } from "@acme/utils";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = typeof id === "string" ? id : id?.[0];
  assert(!!projectId, "Error missing project ID in project screen");

  const { data: project, isLoading: isLoadingProject } = useQuery(
    trpc.budget.getProject.queryOptions({
      id: projectId,
    }),
  );

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery(
    trpc.budget.getProjectTransactions.queryOptions({
      projectId,
    }),
  );

  const { mutate: deleteProject } = useMutation(
    trpc.budget.deleteProject.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.budget.getProjects.queryOptions(),
        );
        router.replace("/");
      },
    }),
  );

  const netTransactions = useMemo(() => {
    return transactions?.reduce((acc, curr) => {
      return acc + Number(curr.transaction.amount);
    }, 0);
  }, [transactions]);

  const handleDelete = () => {
    if (!projectId) return;

    if (platform === "web") {
      if (
        window.confirm(
          "Are you sure you want to delete this project? This action cannot be undone.",
        )
      ) {
        deleteProject({ id: projectId });
      }
    } else {
      Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProject({ id: projectId }),
          },
        ],
      );
    }
  };

  if (!projectId) {
    router.back();
    return null;
  }

  if (isLoadingProject || isLoadingTransactions) {
    return <LoadingScreen message="Loading project details..." />;
  }

  if (!project) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Project not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        transactions?.length ? (
          <View style={styles.headerImage}>
            <LineChart
              areaChart
              curved
              data={transactions
                .map((t) => ({
                  value: Number(t.transaction.amount),
                  date: new Date(t.transaction.date),
                }))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((t) => ({ value: t.value }))}
              height={178}
              width={290}
              showVerticalLines
              initialSpacing={0}
              color1="skyblue"
              textColor1="white"
              hideDataPoints
              dataPointsColor1="blue"
              startFillColor1="skyblue"
              startOpacity={0.8}
              endOpacity={0.3}
            />
          </View>
        ) : (
          <Image source={headerLogo} style={styles.headerImage} />
        )
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title">{project.name}</ThemedText>
          <Button variant="outline" onPress={handleDelete}>
            Delete Project
          </Button>
        </View>
        {project.description && (
          <ThemedText style={styles.description}>
            {project.description}
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
            <ThemedText type="defaultSemiBold">${project.budget}</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText
              style={styles.summaryLabel}
              lightColor={Colors.light.secondaryText}
              darkColor={Colors.dark.secondaryText}
            >
              Net Transactions
            </ThemedText>
            {netTransactions ? (
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
            ) : (
              <ThemedText style={styles.positive}>
                No transactions made
              </ThemedText>
            )}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Transactions</ThemedText>
            <Button
              onPress={() =>
                router.push(`/project/${projectId}/transaction/new`)
              }
              variant="default"
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
                    ${Math.abs(Number(item.transaction.amount)).toFixed(2)}
                  </ThemedText>
                  <ThemedView
                    style={styles.transactionType}
                    lightColor={
                      Number(item.transaction.amount) >= 0
                        ? Colors.light.positive
                        : Colors.light.negative
                    }
                    darkColor={
                      Number(item.transaction.amount) >= 0
                        ? Colors.dark.positive
                        : Colors.dark.negative
                    }
                  >
                    <ThemedText
                      style={styles.transactionTypeText}
                      lightColor="#FFFFFF"
                      darkColor="#FFFFFF"
                    >
                      {Number(item.transaction.amount) >= 0
                        ? "Incoming"
                        : "Outgoing"}
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
