import { useCallback, useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { trpc } from "@/hooks/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getFirstEl } from "@acme/utils";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const queryClient = useQueryClient();

  // Fetch existing project data if editing
  const { data: projects } = useQuery(
    trpc.budget.getProjectSummary.queryOptions(
      {
        projectId: id ?? "",
      },
      {
        enabled: Boolean(id),
      },
    ),
  );

  const project = getFirstEl(projects);

  // Set initial form values when editing
  useEffect(() => {
    if (project) {
      setName(project.projectName);
      // Project description is not in the type, so we'll leave it empty
      setDescription("");
      setBudget(project.projectBudget);
    }
  }, [project]);

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

  const updateMutation = useMutation(
    trpc.budget.updateProject.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.budget.getProjects.queryOptions(),
        );
        if (id) {
          void queryClient.invalidateQueries(
            trpc.budget.getProjectSummary.queryOptions({
              projectId: id,
            }),
          );
        }
        router.back();
      },
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(() => {
    if (!name.trim() || !budget) return;
    const budgetNumber = parseFloat(budget);
    if (isNaN(budgetNumber)) return;

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      budget: budgetNumber,
    };

    if (isEditing && id) {
      updateMutation.mutate({
        id,
        data: {
          ...data,
          startDate: undefined,
          endDate: undefined,
        },
      });
    } else {
      createMutation.mutate(data);
    }
  }, [
    name,
    description,
    budget,
    isEditing,
    id,
    createMutation,
    updateMutation,
  ]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {isEditing ? "Edit Project" : "New Project"}
      </ThemedText>

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

        <View style={styles.buttons}>
          <Button onPress={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={
              !name.trim() || !budget || isNaN(parseFloat(budget)) || isPending
            }
          >
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Project"}
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
