"use client";

import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ProjectCard } from "@/components/budget/ProjectCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { trpc } from "@/hooks/api";
import { useQuery } from "@tanstack/react-query";

export default function HomeScreen() {
  const { data: projects, isLoading } = useQuery(
    trpc.budget.getProjects.queryOptions(),
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading projects...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Projects</ThemedText>
        <Button onPress={() => router.push("/project/new")} variant="default">
          New Project
        </Button>
      </View>

      {projects?.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">No projects yet</ThemedText>
          <ThemedText>Create your first project to get started!</ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.projectList}>
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description ?? undefined}
            />
          ))}
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
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  projectList: {
    gap: 12,
  },
});
