import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [attachments, setAttachments] = useState<
    { name: string; type: string }[]
  >([]);

  // UI state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("pdf");

  const handleAddAttachment = () => {
    if (attachmentName.trim()) {
      setAttachments([
        ...attachments,
        { name: attachmentName, type: attachmentType },
      ]);
      setAttachmentName("");
      setAttachmentType("pdf");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    trpc.announcement.getCategories.queryOptions(),
  );

  // Fetch authors
  const { data: authors = [], isLoading: isAuthorsLoading } = useQuery(
    trpc.announcement.getAuthors.queryOptions(),
  );

  // Set up query client for invalidation
  const queryClient = useQueryClient();

  // Create announcement mutation
  const createAnnouncementMutation = useMutation(
    trpc.announcement.createAnnouncement.mutationOptions({
      onSuccess: () => {
        // Invalidate queries to refresh data
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "announcement.getAnnouncements",
        });

        // Show success message
        Alert.alert("Success", "Announcement created successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      onError: (error) => {
        Alert.alert("Error", `Failed to create announcement: ${error.message}`);
      },
    }),
  );

  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter content");
      return;
    }

    if (!categoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!authorId) {
      Alert.alert("Error", "Please select an author");
      return;
    }

    // Create announcement using TRPC mutation
    createAnnouncementMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      authorId,
      isImportant,
      attachments: attachments.map((att) => ({
        name: att.name,
        url: `/documents/${att.name.toLowerCase().replace(/\s+/g, "-")}`,
        type: att.type as "pdf" | "doc" | "image" | "other",
      })),
    });
  };

  // Loading state
  const isLoading =
    isCategoriesLoading ||
    isAuthorsLoading ||
    createAnnouncementMutation.isPending;

  // Show loading indicator during API operations
  if (isLoading && !showCategoryDropdown && !showAuthorDropdown) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Create Announcement",
            headerShown: true,
          }}
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={{ marginTop: 16 }}>
            {createAnnouncementMutation.isPending
              ? "Creating announcement..."
              : "Loading..."}
          </ThemedText>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Announcement",
          headerShown: true,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.formContainer}>
            {/* Title input */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Title</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.cardBorder },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter announcement title"
                placeholderTextColor={colors.secondaryText}
              />
            </View>

            {/* Category selector */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <Pressable
                style={[styles.dropdown, { borderColor: colors.cardBorder }]}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <ThemedText>
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name
                    : "Select category"}
                </ThemedText>
              </Pressable>

              {showCategoryDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.cardBackground,
                    },
                  ]}
                >
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.dropdownItem,
                        categoryId === category.id && {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                      onPress={() => {
                        setCategoryId(category.id);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <View
                        style={[
                          styles.categoryColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <ThemedText>{category.name}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Author selector */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Author</ThemedText>
              <Pressable
                style={[styles.dropdown, { borderColor: colors.cardBorder }]}
                onPress={() => setShowAuthorDropdown(!showAuthorDropdown)}
              >
                <ThemedText>
                  {authorId
                    ? authors.find((a) => a.id === authorId)?.name
                    : "Select author"}
                </ThemedText>
              </Pressable>

              {showAuthorDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.cardBackground,
                    },
                  ]}
                >
                  {authors.map((author) => (
                    <Pressable
                      key={author.id}
                      style={[
                        styles.dropdownItem,
                        authorId === author.id && {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                      onPress={() => {
                        setAuthorId(author.id);
                        setShowAuthorDropdown(false);
                      }}
                    >
                      <ThemedText>{author.name}</ThemedText>
                      <ThemedText style={styles.authorRole}>
                        {author.role}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Content input */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Content</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.text, borderColor: colors.cardBorder },
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="Enter announcement content"
                placeholderTextColor={colors.secondaryText}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Important toggle */}
            <View style={[styles.formGroup, styles.switchContainer]}>
              <ThemedText style={styles.label}>Mark as Important</ThemedText>
              <Switch
                value={isImportant}
                onValueChange={setIsImportant}
                trackColor={{ false: "#767577", true: colors.tint }}
                thumbColor="#f4f3f4"
              />
            </View>

            {/* Attachments */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Attachments</ThemedText>

              {/* Attachment list */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment, index) => (
                    <View
                      key={index}
                      style={[
                        styles.attachmentItem,
                        { borderColor: colors.cardBorder },
                      ]}
                    >
                      <View style={styles.attachmentInfo}>
                        <ThemedText style={styles.attachmentName}>
                          {attachment.name}
                        </ThemedText>
                        <ThemedText style={styles.attachmentType}>
                          {attachment.type.toUpperCase()}
                        </ThemedText>
                      </View>
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => handleRemoveAttachment(index)}
                      >
                        <ThemedText style={styles.removeButtonText}>
                          Remove
                        </ThemedText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Add attachment form */}
              <View style={styles.addAttachmentForm}>
                <TextInput
                  style={[
                    styles.input,
                    styles.attachmentInput,
                    { color: colors.text, borderColor: colors.cardBorder },
                  ]}
                  value={attachmentName}
                  onChangeText={setAttachmentName}
                  placeholder="Attachment name (e.g. Schedule.pdf)"
                  placeholderTextColor={colors.secondaryText}
                />

                <View style={styles.attachmentTypeContainer}>
                  <Pressable
                    style={[
                      styles.attachmentTypeButton,
                      attachmentType === "pdf" && {
                        backgroundColor: colors.tint,
                      },
                    ]}
                    onPress={() => setAttachmentType("pdf")}
                  >
                    <ThemedText
                      style={[
                        styles.attachmentTypeText,
                        attachmentType === "pdf" && { color: "#FFFFFF" },
                      ]}
                    >
                      PDF
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.attachmentTypeButton,
                      attachmentType === "doc" && {
                        backgroundColor: colors.tint,
                      },
                    ]}
                    onPress={() => setAttachmentType("doc")}
                  >
                    <ThemedText
                      style={[
                        styles.attachmentTypeText,
                        attachmentType === "doc" && { color: "#FFFFFF" },
                      ]}
                    >
                      DOC
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.attachmentTypeButton,
                      attachmentType === "image" && {
                        backgroundColor: colors.tint,
                      },
                    ]}
                    onPress={() => setAttachmentType("image")}
                  >
                    <ThemedText
                      style={[
                        styles.attachmentTypeText,
                        attachmentType === "image" && { color: "#FFFFFF" },
                      ]}
                    >
                      IMAGE
                    </ThemedText>
                  </Pressable>
                </View>

                <Button onPress={handleAddAttachment}>Add Attachment</Button>
              </View>
            </View>

            {/* Submit button */}
            <Button onPress={handleSubmit}>Create Announcement</Button>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  authorRole: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachmentsList: {
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
  },
  attachmentType: {
    fontSize: 12,
    opacity: 0.7,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    borderRadius: 4,
  },
  removeButtonText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "600",
  },
  addAttachmentForm: {
    gap: 8,
  },
  attachmentInput: {
    marginBottom: 8,
  },
  attachmentTypeContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  attachmentTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  attachmentTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
