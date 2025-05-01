import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface Community {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  bannerImage?: string;
  avatarImage?: string;
  createdAt: string;
  isMember?: boolean;
}

// Mock data for communities
const mockCommunities: Community[] = [
  {
    id: "community_123",
    name: "testcommunity",
    description: "A test community for Reddit clone",
    memberCount: 1000,
    createdAt: new Date().toISOString(),
    isMember: true,
  },
  {
    id: "community_456",
    name: "programming",
    description: "All things programming",
    memberCount: 5000,
    createdAt: new Date().toISOString(),
    isMember: false,
  },
  {
    id: "community_789",
    name: "reactnative",
    description: "React Native discussions",
    memberCount: 3000,
    createdAt: new Date().toISOString(),
    isMember: false,
  },
];

export default function CommunitiesScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);

  // Fetch communities - using mock data for now
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["communities"],
    queryFn: () => ({ communities }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleJoinCommunity = async (
    communityId: string,
    isJoined: boolean,
  ) => {
    try {
      // Update the local state to simulate API call
      setCommunities((prevCommunities) =>
        prevCommunities.map((community) =>
          community.id === communityId
            ? { ...community, isMember: !isJoined }
            : community,
        ),
      );

      // In a real app, this would call the API
      console.log(
        `${isJoined ? "Leaving" : "Joining"} community: ${communityId}`,
      );

      // Simulate an API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Refresh the list
      void refetch();
    } catch (error) {
      console.error("Error joining/leaving community:", error);
    }
  };

  const renderCommunity = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={[
        styles.communityContainer,
        colorScheme === "dark"
          ? styles.darkCommunityContainer
          : styles.lightCommunityContainer,
      ]}
      onPress={() => {
        // Navigate to community detail - using index for now
        router.push(`/(tabs)?community=${item.name}`);
      }}
    >
      <View style={styles.communityInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="people-circle" size={40} color="#FF4500" />
        </View>
        <View style={styles.communityDetails}>
          <ThemedText style={styles.communityName}>r/{item.name}</ThemedText>
          <ThemedText style={styles.memberCount}>
            {item.memberCount} {item.memberCount === 1 ? "member" : "members"}
          </ThemedText>
          {item.description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.joinButton,
          item.isMember ? styles.leaveButton : styles.joinButtonActive,
        ]}
        onPress={() => handleJoinCommunity(item.id, !!item.isMember)}
      >
        <ThemedText
          style={[
            styles.joinButtonText,
            item.isMember
              ? styles.leaveButtonText
              : styles.joinButtonTextActive,
          ]}
        >
          {item.isMember ? "Joined" : "Join"}
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <ThemedText style={styles.loadingText}>
          Loading communities...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={data?.communities ?? []}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Communities</ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No communities found
            </ThemedText>
          </View>
        }
      />
      <TouchableOpacity
        style={[
          styles.createCommunityButton,
          colorScheme === "dark"
            ? styles.darkCreateButton
            : styles.lightCreateButton,
        ]}
        onPress={() => router.push("/(tabs)")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  communityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lightCommunityContainer: {
    backgroundColor: "#fff",
  },
  darkCommunityContainer: {
    backgroundColor: "#1a1a1a",
  },
  communityInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  memberCount: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  joinButtonActive: {
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
  },
  leaveButton: {
    backgroundColor: "transparent",
    borderColor: "#FF4500",
  },
  joinButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  joinButtonTextActive: {
    color: "#fff",
  },
  leaveButtonText: {
    color: "#FF4500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  createCommunityButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  lightCreateButton: {
    backgroundColor: "#FF4500", // Reddit orange
  },
  darkCreateButton: {
    backgroundColor: "#FF4500", // Reddit orange
  },
});
