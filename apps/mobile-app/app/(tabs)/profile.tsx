import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useUser } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface UserPost {
  id: string;
  title: string;
  communityName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Mock user posts data
  const mockPosts: UserPost[] = [
    {
      id: "post_123",
      title: "My first post in the community",
      communityName: "testcommunity",
      upvotes: 42,
      downvotes: 7,
      commentCount: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: "post_456",
      title: "Question about React Native",
      communityName: "reactnative",
      upvotes: 21,
      downvotes: 3,
      commentCount: 5,
      createdAt: new Date().toISOString(),
    },
  ];

  // Fetch user posts - using mock data for now
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["userPosts"],
    queryFn: () => ({ posts: mockPosts }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await refetch();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: UserPost }) => (
    <TouchableOpacity
      style={[
        styles.postContainer,
        colorScheme === "dark"
          ? styles.darkPostContainer
          : styles.lightPostContainer,
      ]}
      onPress={() => router.push(`/(tabs)?postId=${item.id}`)}
    >
      <View style={styles.postHeader}>
        <ThemedText style={styles.communityName}>
          r/{item.communityName}
        </ThemedText>
        <ThemedText style={styles.postDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
      <View style={styles.postFooter}>
        <View style={styles.voteContainer}>
          <Ionicons
            name="arrow-up"
            size={16}
            color={colorScheme === "dark" ? "#ccc" : "#666"}
          />
          <ThemedText style={styles.voteCount}>
            {item.upvotes - item.downvotes}
          </ThemedText>
        </View>
        <View style={styles.commentContainer}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={colorScheme === "dark" ? "#ccc" : "#666"}
          />
          <ThemedText style={styles.commentCount}>
            {item.commentCount}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {user && user.image ? (
              <Image source={{ uri: user.image }} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: "#FF4500" },
                ]}
              >
                <ThemedText style={styles.profileImagePlaceholderText}>
                  {user && user.name ? user.name.charAt(0) : "U"}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.username}>
            u/
            {user && typeof user !== "boolean"
              ? ((user as { username?: string; name?: string }).username ??
                (user as { username?: string; name?: string }).name ??
                "Anonymous")
              : "Anonymous"}
          </ThemedText>
          <ThemedText style={styles.karma}>
            {Math.floor(Math.random() * 10000)} karma
          </ThemedText>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {data?.posts.length ?? 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Posts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {Math.floor(Math.random() * 20)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Communities</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {Math.floor(Math.random() * 100)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Comments</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Your Posts</ThemedText>
        </View>

        {data?.posts.map((post) => renderPost({ item: post }))}

        {(!data?.posts || data.posts.length === 0) && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              You haven't created any posts yet
            </ThemedText>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => router.push("/(tabs)")}
            >
              <ThemedText style={styles.createPostButtonText}>
                Create a Post
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImageContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  karma: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postContainer: {
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
  lightPostContainer: {
    backgroundColor: "#fff",
  },
  darkPostContainer: {
    backgroundColor: "#1a1a1a",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  communityName: {
    fontWeight: "bold",
  },
  postDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  voteCount: {
    marginHorizontal: 4,
    fontSize: 14,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
