"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

export default function FactsScreen() {
  const colorScheme = useColorScheme();
  const [showFactOfDay, setShowFactOfDay] = useState(true);

  // Get fact of the day
  const factOfDayQuery = trpc.facts.getFactOfTheDay.queryOptions();
  const {
    data: factOfDay,
    isLoading: isLoadingFactOfDay,
    refetch: refetchFactOfDay,
  } = useQuery({
    ...factOfDayQuery,
  });

  // Get random fact
  const randomFactQuery = trpc.facts.getRandomFact.queryOptions();
  const {
    data: randomFact,
    isLoading: isLoadingRandomFact,
    refetch: refetchRandomFact,
  } = useQuery({
    ...randomFactQuery,
    enabled: !showFactOfDay,
  });

  const currentFact = showFactOfDay ? factOfDay : randomFact;
  const isLoading = showFactOfDay ? isLoadingFactOfDay : isLoadingRandomFact;

  const handleRefresh = () => {
    if (showFactOfDay) {
      void refetchFactOfDay();
    } else {
      void refetchRandomFact();
    }
  };

  const toggleFactType = () => {
    setShowFactOfDay(!showFactOfDay);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Random Facts</ThemedText>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleFactType}>
          <ThemedText style={styles.toggleText}>
            {showFactOfDay ? "Fact of the Day" : "Random Fact"}
          </ThemedText>
          <Icon
            name={showFactOfDay ? "calendar" : "shuffle"}
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.factCard}>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
        )}

        {!isLoading && currentFact && (
          <>
            <ThemedText style={styles.factText}>
              {currentFact.content}
            </ThemedText>
            {currentFact.category && (
              <ThemedView style={styles.categoryTag}>
                <ThemedText style={styles.categoryText}>
                  {currentFact.category}
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}

        {!isLoading && !currentFact && (
          <ThemedText>No facts available</ThemedText>
        )}
      </ThemedView>

      <TouchableOpacity
        style={[
          styles.refreshButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
        ]}
        onPress={handleRefresh}
      >
        <Icon name="refresh" size={24} color="#FFFFFF" />
        <ThemedText style={styles.refreshText}>
          {showFactOfDay
            ? "Refresh Fact of the Day"
            : "Get Another Random Fact"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    marginRight: 8,
    fontSize: 14,
  },
  factCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  factText: {
    fontSize: 22,
    textAlign: "center",
    lineHeight: 32,
  },
  categoryTag: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryText: {
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  refreshText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});
