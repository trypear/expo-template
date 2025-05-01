import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

// Note: You would need to install expo-image-picker:
// npx expo install expo-image-picker
// For now, we'll mock the functionality
const ImagePicker = {
  MediaTypeOptions: { Images: "images" },
  launchImageLibraryAsync: () =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "https://picsum.photos/800/400" }],
    }),
};

export default function CreatePostScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("testcommunity");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock communities data
  const communities = [
    { id: "community_123", name: "testcommunity" },
    { id: "community_456", name: "programming" },
    { id: "community_789", name: "reactnative" },
  ];

  const pickImage = async () => {
    // Call the mock function without parameters for simplicity
    const result = await ImagePicker.launchImageLibraryAsync();

    // We know result is defined from our mock
    if (!result.canceled && result.assets.length > 0 && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your post");
      return;
    }

    if (!selectedCommunity) {
      Alert.alert("Error", "Please select a community");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the community ID from the selected community name
      const communityId = communities.find(
        (c) => c.name === selectedCommunity,
      )?.id;

      if (!communityId) {
        throw new Error("Invalid community selected");
      }

      // Import the base URL and token functions
      const { getBaseUrl } = await import("@/hooks/base-url");
      const { getToken } = await import("@/hooks/session-store");

      // Create the post using the API
      const result = await fetch(`${getBaseUrl()}/api/trpc/post.createPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          json: {
            title,
            content,
            communityId,
            imageUrl: image,
          },
        }),
      });

      if (!result.ok) {
        throw new Error("Failed to create post");
      }

      // Navigate back to home screen
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Create Post</ThemedText>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!title.trim() || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            <ThemedText
              style={[
                styles.postButtonText,
                (!title.trim() || isSubmitting) && styles.disabledButtonText,
              ]}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.communitySelector}>
            <Ionicons
              name="people"
              size={20}
              color={colorScheme === "dark" ? "#ccc" : "#666"}
            />
            <ThemedText style={styles.communityLabel}>r/</ThemedText>
            <TouchableOpacity
              style={styles.communityDropdown}
              onPress={() => {
                // In a real app, this would open a community selector
                // For now, we'll just cycle through the available communities
                const currentIndex = communities.findIndex(
                  (c) => c.name === selectedCommunity,
                );
                // Ensure we have a valid index and communities array
                if (communities.length > 0) {
                  const nextIndex = (currentIndex + 1) % communities.length;
                  const nextCommunityName = communities[nextIndex]?.name;
                  if (nextCommunityName) {
                    setSelectedCommunity(nextCommunityName);
                  }
                }
              }}
            >
              <ThemedText style={styles.communityName}>
                {selectedCommunity}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.titleInput,
              colorScheme === "dark" ? styles.darkInput : styles.lightInput,
            ]}
            placeholder="Title"
            placeholderTextColor={colorScheme === "dark" ? "#999" : "#666"}
            value={title}
            onChangeText={setTitle}
            maxLength={300}
          />

          <TextInput
            style={[
              styles.contentInput,
              colorScheme === "dark" ? styles.darkInput : styles.lightInput,
            ]}
            placeholder="Text (optional)"
            placeholderTextColor={colorScheme === "dark" ? "#999" : "#666"}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Ionicons name="close-circle" size={24} color="#FF4500" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
              <Ionicons
                name="image-outline"
                size={24}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons
                name="link-outline"
                size={24}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons
                name="text"
                size={24}
                color={colorScheme === "dark" ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: "#FF4500",
  },
  postButton: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  communitySelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  communityLabel: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  communityDropdown: {
    flexDirection: "row",
    alignItems: "center",
  },
  communityName: {
    fontWeight: "bold",
    marginRight: 4,
  },
  titleInput: {
    padding: 16,
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  contentInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 200,
  },
  lightInput: {
    color: "#000",
  },
  darkInput: {
    color: "#fff",
  },
  imagePreviewContainer: {
    margin: 16,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
  toolbar: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  toolbarButton: {
    marginRight: 24,
    padding: 4,
  },
});
