import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "./ThemedText";
import { Icon } from "./ui/Icons";

interface TransactionItemProps {
  id: string;
  description: string;
  amount: string;
  date: Date;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  isExpense: boolean;
}

export function TransactionItem({
  id,
  description,
  amount,
  date,
  categoryName,
  categoryIcon,
  categoryColor,
  isExpense,
}: TransactionItemProps) {
  const router = useRouter();

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/transaction-detail",
          params: { id },
        })
      }
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
        <Icon name={categoryIcon as any} size={16} color="#FFFFFF" />
      </View>

      <View style={styles.details}>
        <ThemedText style={styles.description} numberOfLines={1}>
          {description}
        </ThemedText>
        <ThemedText style={styles.category} numberOfLines={1}>
          {categoryName}
        </ThemedText>
      </View>

      <View style={styles.amountContainer}>
        <ThemedText
          style={[styles.amount, { color: isExpense ? "#FF6B6B" : "#4ECDC4" }]}
        >
          {amount}
        </ThemedText>
        <ThemedText style={styles.date}>{formattedDate}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
  },
  category: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
