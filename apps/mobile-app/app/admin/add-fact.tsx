import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function AddEditFactScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const factId = params.id as string | undefined;
  const isEditing = !!factId;

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Get fact details if editing
  const factsQuery = trpc.facts.getFacts.queryOptions();
  const { data: facts, isLoading: isLoadingFact } = useQuery({
    ...factsQuery,
    enabled: !!factId && isEditing,
  });

  // Get categories for dropdown
  const categoriesQuery = trpc.facts.getCategories.queryOptions();
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: categories,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading: isLoadingCategories,
  } = useQuery({
    ...categoriesQuery,
  });

  // Create fact mutation
  const createMutation = useMutation(
    trpc.facts.createFact.mutationOptions({
      onSuccess: () => {
        Alert.alert("Success", "Fact created successfully");
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // Update fact mutation
  const updateMutation = useMutation(
    trpc.facts.updateFact.mutationOptions({
      onSuccess: () => {
        Alert.alert("Success", "Fact updated successfully");
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // Load fact data if editing
  useEffect(() => {
    if (facts && factId) {
      const fact = facts.find((f) => f.id === factId);
      if (fact) {
        setContent(fact.content);
        setCategory(fact.category ?? "");
        setIsActive(fact.isActive);
      }
    }
  }, [facts, factId]);

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content is required");
      return;
    }

    if (isEditing && factId) {
      updateMutation.mutate({
        id: factId,
        content,
        category: category || undefined,
        isActive,
      });
    } else {
      createMutation.mutate({
        content,
        category: category || undefined,
      });
    }
  };

  const isLoading =
    isLoadingFact || createMutation.isPending || updateMutation.isPending;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon
            name="house"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
        <ThemedText type="title">
          {isEditing ? "Edit Fact" : "Add New Fact"}
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {isLoadingFact ? (
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          style={styles.loader}
        />
      ) : (
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Content</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="Enter fact content"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Category (Optional)</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
              value={category}
              onChangeText={setCategory}
              placeholder="Enter category"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          {isEditing && (
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <View style={styles.statusToggle}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    isActive && styles.statusButtonActive,
                  ]}
                  onPress={() => setIsActive(true)}
                >
                  <ThemedText>Active</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    !isActive && styles.statusButtonActive,
                  ]}
                  onPress={() => setIsActive(false)}
                >
                  <ThemedText>Inactive</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
              isLoading && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {isEditing ? "Update Fact" : "Create Fact"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  statusToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    overflow: "hidden",
  },
  statusButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
