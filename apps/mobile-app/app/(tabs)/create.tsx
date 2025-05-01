import React, { useState } from "react";
import {
  Alert,
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

type CreateType = "post" | "community";

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [createType, setCreateType] = useState<CreateType>("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("testcommunity");
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock communities data
  const communities = [
    { id: "community_123", name: "testcommunity" },
    { id: "community_456", name: "programming" },
    { id: "community_789", name: "reactnative" },
  ];

  const handleCreatePost = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your post");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would submit the post to the API
      console.log("Creating post:", {
        title,
        content,
        communityId: communities.find((c) => c.name === selectedCommunity)?.id,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to home screen
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!communityName.trim()) {
      Alert.alert("Error", "Please enter a name for your community");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would submit the community to the API
      console.log("Creating community:", {
        name: communityName,
        description: communityDescription,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to communities screen
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error creating community:", error);
      Alert.alert("Error", "Failed to create community. Please try again.");
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
          <ThemedText style={styles.headerTitle}>
            Create {createType === "post" ? "Post" : "Community"}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (createType === "post" && !title.trim()) ||
              (createType === "community" && !communityName.trim()) ||
              isSubmitting
                ? styles.disabledButton
                : null,
            ]}
            onPress={
              createType === "post" ? handleCreatePost : handleCreateCommunity
            }
            disabled={
              (createType === "post" && !title.trim()) ||
              (createType === "community" && !communityName.trim()) ||
              isSubmitting
            }
          >
            <ThemedText
              style={[
                styles.submitButtonText,
                (createType === "post" && !title.trim()) ||
                (createType === "community" && !communityName.trim()) ||
                isSubmitting
                  ? styles.disabledButtonText
                  : null,
              ]}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              createType === "post" ? styles.activeTypeButton : null,
            ]}
            onPress={() => setCreateType("post")}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={createType === "post" ? "#fff" : "#FF4500"}
            />
            <ThemedText
              style={[
                styles.typeButtonText,
                createType === "post" ? styles.activeTypeButtonText : null,
              ]}
            >
              Post
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              createType === "community" ? styles.activeTypeButton : null,
            ]}
            onPress={() => setCreateType("community")}
          >
            <Ionicons
              name="people"
              size={20}
              color={createType === "community" ? "#fff" : "#FF4500"}
            />
            <ThemedText
              style={[
                styles.typeButtonText,
                createType === "community" ? styles.activeTypeButtonText : null,
              ]}
            >
              Community
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {createType === "post" ? (
            <>
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
            </>
          ) : (
            <>
              <TextInput
                style={[
                  styles.titleInput,
                  colorScheme === "dark" ? styles.darkInput : styles.lightInput,
                ]}
                placeholder="Community Name"
                placeholderTextColor={colorScheme === "dark" ? "#999" : "#666"}
                value={communityName}
                onChangeText={setCommunityName}
                maxLength={21}
              />

              <TextInput
                style={[
                  styles.contentInput,
                  colorScheme === "dark" ? styles.darkInput : styles.lightInput,
                ]}
                placeholder="Description (optional)"
                placeholderTextColor={colorScheme === "dark" ? "#999" : "#666"}
                value={communityDescription}
                onChangeText={setCommunityDescription}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#FF4500"
                  style={styles.infoIcon}
                />
                <ThemedText style={styles.infoText}>
                  Community names must be between 3-21 characters and can only
                  contain letters, numbers, and underscores.
                </ThemedText>
              </View>
            </>
          )}
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
  submitButton: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#fff",
  },
  typeSelector: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF4500",
    marginRight: 12,
  },
  activeTypeButton: {
    backgroundColor: "#FF4500",
  },
  typeButtonText: {
    marginLeft: 8,
    color: "#FF4500",
    fontWeight: "bold",
  },
  activeTypeButtonText: {
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
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
