import React from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface HelpRequestItem {
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

export default function HelpRequestsScreen() {
  const router = useRouter();
  const _user = useUser();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch } = useQuery(
    trpc.helpRequest.list.queryOptions({
      page: 1,
      limit: 20,
    }),
  );

  const helpRequests = data?.items ?? [];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusColor = (
    status: HelpRequestItem["helpRequest"]["requestStatus"],
  ) => {
    switch (status) {
      case "open":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          text: "text-yellow-600 dark:text-yellow-400",
        };
      case "in_progress":
        return {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-600 dark:text-blue-400",
        };
      case "resolved":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-600 dark:text-green-400",
        };
      case "closed":
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-600 dark:text-gray-400",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList<HelpRequestItem>
        data={helpRequests}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => {
          const statusColors = getStatusColor(item.helpRequest.requestStatus);
          return (
            <Pressable
              onPress={() => router.push(`/help/${item.helpRequest.id}`)}
              className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800"
            >
              <View className="p-4">
                <View className="flex-row items-start justify-between">
                  <ThemedText className="flex-1 text-xl font-bold">
                    {item.helpRequest.title}
                  </ThemedText>
                  <View
                    className={`ml-2 rounded-full px-3 py-1 ${statusColors.bg}`}
                  >
                    <ThemedText
                      className={`text-xs font-medium ${statusColors.text}`}
                    >
                      {item.helpRequest.requestStatus
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText
                  className="mt-2 text-base text-gray-600 dark:text-gray-400"
                  numberOfLines={2}
                >
                  {item.helpRequest.description}
                </ThemedText>

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={14} color="#666" />
                    <ThemedText className="ml-1 text-sm text-gray-500">
                      {item.createdBy.name || "Unknown"}
                    </ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <ThemedText className="ml-1 text-sm text-gray-500">
                      {item.helpRequest.createdAt
                        ? new Date(
                            item.helpRequest.createdAt,
                          ).toLocaleDateString()
                        : "No date"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center rounded-xl bg-white p-8 dark:bg-gray-800">
            <Ionicons name="help-buoy-outline" size={48} color="#666" />
            <ThemedText className="mt-4 text-center text-gray-500">
              No help requests yet
            </ThemedText>
          </View>
        )}
      />
      <Pressable
        onPress={() => router.push("/help/new")}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </Pressable>
    </ThemedView>
  );
}
