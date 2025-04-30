import { useCallback, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import DatePicker from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { trpc } from "@/hooks/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProjectScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.budget.createProject.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.budget.getProjects.queryOptions(),
        );
        router.back();
      },
    }),
  );

  const handleSubmit = useCallback(() => {
    if (!name.trim() || !budget) return;
    const budgetNumber = parseFloat(budget);
    if (isNaN(budgetNumber)) return;

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      budget: budgetNumber,
      startDate: startDate,
      endDate: endDate,
    };

    createMutation.mutate(data);
  }, [name, description, budget, startDate, endDate, createMutation]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">New Project</ThemedText>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Project name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Description (optional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Project description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Budget</ThemedText>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="Enter budget"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Start Date</ThemedText>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            mode="date"
            className="w-full"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>End Date</ThemedText>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            mode="date"
            minimumDate={startDate}
            className="w-full"
          />
        </View>

        <View style={styles.buttons}>
          <Button onPress={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={
              !name.trim() ||
              !budget ||
              isNaN(parseFloat(budget)) ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
});
