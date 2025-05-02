import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";

interface HelpRequestDetail {
  helpRequest: {
    id: string;
    title: string;
    description: string;
    requestStatus: "open" | "in_progress" | "resolved" | "closed";
    createdAt: Date | null;
  };
  createdBy: {
    id: string;
    name: string | null;
  };
}

export default function HelpRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();

  const { data: helpRequest, refetch } = useQuery(
    trpc.helpRequest.getById.queryOptions({
      id,
    }),
  ) as { data: HelpRequestDetail | undefined; refetch: () => Promise<unknown> };

  const updateStatusMutation = useMutation(
    trpc.helpRequest.updateStatus.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
    }),
  );

  const getStatusColor = (
    status: HelpRequestDetail["helpRequest"]["requestStatus"],
  ) => {
    switch (status) {
      case "open":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          text: "text-yellow-600 dark:text-yellow-400",
          icon: "alert-circle" as const,
        };
      case "in_progress":
        return {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-600 dark:text-blue-400",
          icon: "time" as const,
        };
      case "resolved":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-600 dark:text-green-400",
          icon: "checkmark-circle" as const,
        };
      case "closed":
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-600 dark:text-gray-400",
          icon: "close-circle" as const,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-600 dark:text-gray-400",
          icon: "help-circle" as const,
        };
    }
  };

  const handleStatusChange = (
    newStatus: HelpRequestDetail["helpRequest"]["requestStatus"],
  ) => {
    updateStatusMutation.mutate({
      id,
      status: newStatus,
    });
  };

  if (!helpRequest) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Ionicons name="help-buoy-outline" size={48} color="#666" />
        <ThemedText className="mt-4 text-gray-500">Loading...</ThemedText>
      </ThemedView>
    );
  }

  const statusColors = getStatusColor(helpRequest.helpRequest.requestStatus);

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className="overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <ThemedText className="flex-1 text-2xl font-bold">
              {helpRequest.helpRequest.title}
            </ThemedText>
            <View className={`ml-3 rounded-full px-4 py-2 ${statusColors.bg}`}>
              <View className="flex-row items-center">
                <Ionicons
                  name={statusColors.icon}
                  size={16}
                  color={
                    helpRequest.helpRequest.requestStatus === "open"
                      ? "#CA8A04"
                      : helpRequest.helpRequest.requestStatus === "in_progress"
                        ? "#2563EB"
                        : helpRequest.helpRequest.requestStatus === "resolved"
                          ? "#16A34A"
                          : "#666"
                  }
                />
                <ThemedText className={`ml-2 font-medium ${statusColors.text}`}>
                  {helpRequest.helpRequest.requestStatus
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </ThemedText>
              </View>
            </View>
          </View>

          <View className="mb-6 flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={16} color="#666" />
              <ThemedText className="ml-2 text-sm text-gray-500">
                {helpRequest.createdBy.name || "Unknown"}
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#666" />
              <ThemedText className="ml-2 text-sm text-gray-500">
                {helpRequest.helpRequest.createdAt
                  ? new Date(
                      helpRequest.helpRequest.createdAt,
                    ).toLocaleDateString()
                  : "No date"}
              </ThemedText>
            </View>
          </View>

          <View className="mb-8">
            <ThemedText className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {helpRequest.helpRequest.description}
            </ThemedText>
          </View>

          {(user as { role?: string })?.role === "admin" && (
            <View>
              <ThemedText className="mb-3 text-lg font-semibold">
                Update Status
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {(["open", "in_progress", "resolved", "closed"] as const).map(
                  (status) => {
                    const colors = getStatusColor(status);
                    const isActive =
                      helpRequest.helpRequest.requestStatus === status;
                    return (
                      <Pressable
                        key={status}
                        onPress={() => handleStatusChange(status)}
                        disabled={updateStatusMutation.isPending}
                        className={`flex-row items-center rounded-full px-4 py-2 ${
                          isActive ? colors.bg : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Ionicons
                          name={colors.icon}
                          size={16}
                          color={
                            isActive
                              ? status === "open"
                                ? "#CA8A04"
                                : status === "in_progress"
                                  ? "#2563EB"
                                  : status === "resolved"
                                    ? "#16A34A"
                                    : "#666"
                              : "#666"
                          }
                        />
                        <ThemedText
                          className={`ml-2 font-medium ${
                            isActive
                              ? colors.text
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </ThemedText>
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
