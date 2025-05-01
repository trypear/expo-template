"use client";

import React, { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

// Define the Post interface to match the API response
interface Post {
  id: string;
  title: string;
  content: string | null;
  authorName: string;
  communityName: string;
  upvotes: number | null;
  downvotes: number | null;
  commentCount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  imageUrl: string | null;
  linkUrl: string | null;
}

// Helper function to safely calculate votes
const calculateVotes = (
  upvotes: number | null,
  downvotes: number | null,
): number => {
  return (upvotes ?? 0) - (downvotes ?? 0);
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  // Check if we need to show a specific post or community
  const postId = params.postId as string | undefined;
  const communityName = params.community as string | undefined;
  // Uncomment if needed for community filtering by ID
  // const communityId = params.communityId as string | undefined;

  // Fetch posts from the API
  const {
    data: postsData,
    isLoading,
    refetch,
  } = useQuery(
    trpc.post.getHomeFeed.queryOptions({
      limit: 20,
    }),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[
        styles.postContainer,
        colorScheme === "dark"
          ? styles.darkPostContainer
          : styles.lightPostContainer,
      ]}
      onPress={() => {
        // Navigate to post detail
        router.push(`/(post)/${item.id}`);
      }}
    >
      <View style={styles.postHeader}>
        <ThemedText style={styles.communityName}>
          r/{item.communityName}
        </ThemedText>
        <ThemedText style={styles.postAuthor}>
          Posted by u/{item.authorName}
        </ThemedText>
      </View>

      <ThemedText style={styles.postTitle}>{item.title}</ThemedText>

      {item.content && (
        <ThemedText style={styles.postContent} numberOfLines={3}>
          {item.content}
        </ThemedText>
      )}

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}

      <View style={styles.postFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons
              name="arrow-up"
              size={20}
              color={colorScheme === "dark" ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
          <ThemedText style={styles.voteCount}>
            {calculateVotes(item.upvotes, item.downvotes)}
          </ThemedText>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons
              name="arrow-down"
              size={20}
              color={colorScheme === "dark" ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.commentButton}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colorScheme === "dark" ? "#ccc" : "#666"}
          />
          <ThemedText style={styles.commentCount}>
            {item.commentCount ?? 0}{" "}
            {(item.commentCount ?? 0) === 1 ? "comment" : "comments"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons
            name="share-outline"
            size={20}
            color={colorScheme === "dark" ? "#ccc" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Get posts from the API response
  const posts = postsData?.posts ?? [];

  // If postId is provided, find the selected post from the posts array
  const selectedPost = postId
    ? posts.find((post) => post.id === postId)
    : undefined;

  // Prepare posts for display
  let filteredPosts = posts;

  // Apply community filter if needed
  /* eslint-disable-next-line */
  if (communityName && communityName.length > 0) {
    filteredPosts = posts.filter(
      (post) => post.communityName === communityName,
    );
  }

  // Render loading state, post detail, or post list based on conditions
  /* eslint-disable */
  return (
    <>
      {isLoading && (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading posts...</ThemedText>
        </ThemedView>
      )}

      {!isLoading && selectedPost && (
        <ThemedView style={styles.container}>
          <View style={styles.postDetailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            <ThemedText style={styles.postDetailTitle}>Post</ThemedText>
          </View>

          {renderPost({ item: selectedPost as Post })}

          <View style={styles.commentsSection}>
            <ThemedText style={styles.commentsSectionTitle}>
              Comments ({selectedPost.commentCount ?? 0})
            </ThemedText>

            <View style={styles.commentInputContainer}>
              <TouchableOpacity
                style={styles.commentInputButton}
                onPress={() => console.log("Add comment")}
              >
                <ThemedText style={styles.commentInputButtonText}>
                  Add a comment...
                </ThemedText>
              </TouchableOpacity>
            </View>

            {(selectedPost.commentCount ?? 0) === 0 ? (
              <View style={styles.noCommentsContainer}>
                <ThemedText style={styles.noCommentsText}>
                  No comments yet. Be the first to comment!
                </ThemedText>
              </View>
            ) : (
              <View
                style={[
                  styles.mockCommentContainer,
                  colorScheme === "dark"
                    ? { backgroundColor: "#1a1a1a" }
                    : null,
                ]}
              >
                <View style={styles.commentHeader}>
                  <ThemedText style={styles.commentAuthor}>
                    u/FirstCommenter
                  </ThemedText>
                </View>
                <ThemedText style={styles.commentContent}>
                  This is a mock comment since we don't have real comments yet.
                </ThemedText>
                <View style={styles.commentFooter}>
                  <View style={styles.commentVoteContainer}>
                    <TouchableOpacity style={styles.commentVoteButton}>
                      <Ionicons
                        name="arrow-up"
                        size={16}
                        color={colorScheme === "dark" ? "#ccc" : "#666"}
                      />
                    </TouchableOpacity>
                    <ThemedText style={styles.commentVoteCount}>5</ThemedText>
                    <TouchableOpacity style={styles.commentVoteButton}>
                      <Ionicons
                        name="arrow-down"
                        size={16}
                        color={colorScheme === "dark" ? "#ccc" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.replyButton}>
                    {/* eslint-disable-next-line */}
                    <ThemedText style={styles.replyButtonText}>
                      Reply
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ThemedView>
      )}

      {!isLoading && !selectedPost && (
        <ThemedView style={styles.container}>
          <FlatList
            data={filteredPosts as Post[]}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>
                  {communityName ? `r/${communityName}` : "Home"}
                </ThemedText>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No posts found</ThemedText>
              </View>
            }
          />
          <TouchableOpacity
            style={[
              styles.createPostButton,
              colorScheme === "dark"
                ? styles.darkCreateButton
                : styles.lightCreateButton,
            ]}
            onPress={() => router.push("/create-post")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </ThemedView>
      )}
    </>
  );
  /* eslint-enable */
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
    marginBottom: 8,
  },
  communityName: {
    fontWeight: "bold",
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 12,
    opacity: 0.7,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    marginHorizontal: 4,
    fontWeight: "bold",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    padding: 4,
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 12,
  },
  shareButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  createPostButton: {
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
  postDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  postDetailTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentsSection: {
    flex: 1,
    padding: 16,
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  commentInputContainer: {
    marginBottom: 16,
  },
  commentInputButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    padding: 12,
  },
  commentInputButtonText: {
    opacity: 0.6,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  mockCommentContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentVoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentVoteButton: {
    padding: 4,
  },
  commentVoteCount: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
