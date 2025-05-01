import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content?: string;
  authorName: string;
  communityName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  imageUrl?: string;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [comment, setComment] = useState("");

  // Mock data for post details
  const mockPost: Post = {
    id: id as string,
    title: "Example Post Title",
    content:
      "This is the content of the post. It can be quite long and detailed with multiple paragraphs.\n\nThis is a second paragraph of content to demonstrate how longer posts would look in the detail view.",
    authorName: "JohnDoe",
    communityName: "testcommunity",
    upvotes: 42,
    downvotes: 7,
    commentCount: 15,
    createdAt: new Date().toISOString(),
    imageUrl: "https://picsum.photos/800/400",
  };

  // Mock data for comments
  const mockComments: Comment[] = [
    {
      id: "comment_123",
      content: "This is a top-level comment on the post",
      authorName: "JohnDoe",
      upvotes: 15,
      downvotes: 2,
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: "comment_456",
          content: "This is a reply to the top-level comment",
          authorName: "JaneDoe",
          upvotes: 7,
          downvotes: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "comment_789",
      content: "Another top-level comment on the post",
      authorName: "BobSmith",
      upvotes: 8,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  // Fetch post details - using mock data for now
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", id],
    queryFn: () => mockPost,
  });

  // Fetch comments - using mock data for now
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => mockComments,
  });

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    // In a real app, this would submit the comment to the API
    console.log("Submitting comment:", comment);

    // Clear the input
    setComment("");
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment.id}
      style={[
        styles.commentContainer,
        isReply && styles.replyContainer,
        colorScheme === "dark"
          ? styles.darkCommentContainer
          : styles.lightCommentContainer,
      ]}
    >
      <ThemedText style={styles.commentAuthor}>
        u/{comment.authorName}
      </ThemedText>
      <ThemedText style={styles.commentContent}>{comment.content}</ThemedText>

      <View style={styles.commentFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons
              name="arrow-up"
              size={16}
              color={colorScheme === "dark" ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
          <ThemedText style={styles.voteCount}>
            {comment.upvotes - comment.downvotes}
          </ThemedText>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons
              name="arrow-down"
              size={16}
              color={colorScheme === "dark" ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.replyButton}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={colorScheme === "dark" ? "#ccc" : "#666"}
          />
          <ThemedText style={styles.replyText}>Reply</ThemedText>
        </TouchableOpacity>
      </View>

      {comment.replies?.map((reply) => renderComment(reply, true))}
    </View>
  );

  if (isLoadingPost || isLoadingComments) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <ThemedText style={styles.loadingText}>Loading post...</ThemedText>
      </ThemedView>
    );
  }

  if (!post) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Post not found</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.postContainer,
            colorScheme === "dark"
              ? styles.darkPostContainer
              : styles.lightPostContainer,
          ]}
        >
          <View style={styles.postHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            <View style={styles.postHeaderInfo}>
              <ThemedText style={styles.communityName}>
                r/{post.communityName}
              </ThemedText>
              <ThemedText style={styles.postAuthor}>
                Posted by u/{post.authorName}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.postTitle}>{post.title}</ThemedText>

          {post.content && (
            <ThemedText style={styles.postContent}>{post.content}</ThemedText>
          )}

          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
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
                {post.upvotes - post.downvotes}
              </ThemedText>
              <TouchableOpacity style={styles.voteButton}>
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={colorScheme === "dark" ? "#ccc" : "#666"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.commentCountContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
              <ThemedText style={styles.commentCount}>
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comment" : "comments"}
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons
                name="share-outline"
                size={20}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={[
              styles.commentInput,
              colorScheme === "dark"
                ? styles.darkCommentInput
                : styles.lightCommentInput,
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={colorScheme === "dark" ? "#999" : "#666"}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.commentSubmitButton,
              !comment.trim() && styles.disabledButton,
            ]}
            onPress={handleSubmitComment}
            disabled={!comment.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.commentsContainer}>
          <ThemedText style={styles.commentsHeader}>
            Comments ({comments?.length ?? 0})
          </ThemedText>

          {comments?.map((comment) => renderComment(comment))}

          {(!comments || comments.length === 0) && (
            <ThemedText style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#FF4500",
    fontSize: 16,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  lightPostContainer: {
    backgroundColor: "#fff",
  },
  darkPostContainer: {
    backgroundColor: "#1a1a1a",
    borderBottomColor: "#333",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  communityName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postAuthor: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
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
  commentCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  shareButton: {
    padding: 4,
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    maxHeight: 100,
  },
  lightCommentInput: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
    color: "#000",
  },
  darkCommentInput: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    color: "#fff",
  },
  commentSubmitButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF4500",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  commentsContainer: {
    padding: 16,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  lightCommentContainer: {
    backgroundColor: "#f9f9f9",
  },
  darkCommentContainer: {
    backgroundColor: "#222",
  },
  replyContainer: {
    marginLeft: 24,
    marginTop: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#FF4500",
  },
  commentAuthor: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  replyText: {
    marginLeft: 4,
    fontSize: 12,
  },
  noCommentsText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
});
