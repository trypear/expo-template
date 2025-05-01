import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

// Days of the week
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Attendance status options
const ATTENDANCE_STATUS = [
  { value: "present", label: "Present", color: "#4ade80" },
  { value: "absent", label: "Absent", color: "#f87171" },
  { value: "late", label: "Late", color: "#facc15" },
  { value: "excused", label: "Excused", color: "#93c5fd" },
];

export default function TeacherScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useUser();
  const queryClient = useQueryClient();

  // State for selected course, date, and view mode
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"timetable" | "attendance">(
    "timetable",
  );

  // Get teacher courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    ...trpc.attendance.getTeacherCourses.queryOptions(),
    enabled: !!user,
  });

  // Get timetable for selected course
  const { data: timetable, isLoading: timetableLoading } = useQuery({
    ...trpc.attendance.getCourseTimetable.queryOptions({
      courseId: selectedCourseId ?? "",
    }),
    enabled: !!selectedCourseId,
  });

  // Mutation for recording attendance
  const recordAttendanceMutation = useMutation({
    ...trpc.attendance.recordAttendance.mutationOptions(),
    onSuccess: async () => {
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: [["attendance", "getStudentAttendance"]],
      });
      Alert.alert("Success", "Attendance recorded successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Mutation for creating timetable entry
  const _createTimetableMutation = useMutation({
    ...trpc.attendance.createTimetable.mutationOptions(),
    onSuccess: async () => {
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: [["attendance", "getCourseTimetable"]],
      });
      Alert.alert("Success", "Timetable entry created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>
          Please log in to access teacher features
        </ThemedText>
      </ThemedView>
    );
  }

  if (coursesLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </ThemedView>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>No courses found</ThemedText>
        <ThemedText style={styles.subtitle}>
          You are not assigned to teach any courses yet.
        </ThemedText>
      </ThemedView>
    );
  }

  // Function to record attendance
  const handleRecordAttendance = (
    studentId: string,
    status: string,
    timetableId: string,
  ) => {
    recordAttendanceMutation.mutate({
      studentId,
      timetableId,
      date: selectedDate,
      status: status as "present" | "absent" | "late" | "excused",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Teacher Dashboard</ThemedText>

      {/* View mode selector */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[
            styles.viewModeTab,
            viewMode === "timetable" && styles.selectedViewModeTab,
            { backgroundColor: isDark ? "#333333" : "#f3f4f6" },
          ]}
          onPress={() => setViewMode("timetable")}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={
              viewMode === "timetable"
                ? "#ffffff"
                : isDark
                  ? "#ffffff"
                  : "#000000"
            }
          />
          <ThemedText
            style={[
              styles.viewModeText,
              viewMode === "timetable" && styles.selectedViewModeText,
            ]}
          >
            Timetable
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewModeTab,
            viewMode === "attendance" && styles.selectedViewModeTab,
            { backgroundColor: isDark ? "#333333" : "#f3f4f6" },
          ]}
          onPress={() => setViewMode("attendance")}
        >
          <Ionicons
            name="checkbox-outline"
            size={20}
            color={
              viewMode === "attendance"
                ? "#ffffff"
                : isDark
                  ? "#ffffff"
                  : "#000000"
            }
          />
          <ThemedText
            style={[
              styles.viewModeText,
              viewMode === "attendance" && styles.selectedViewModeText,
            ]}
          >
            Attendance
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Course selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.courseSelector}
      >
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={[
              styles.courseTab,
              selectedCourseId === course.id && styles.selectedCourseTab,
              { backgroundColor: isDark ? "#333333" : "#f3f4f6" },
            ]}
            onPress={() => setSelectedCourseId(course.id)}
          >
            <ThemedText
              style={[
                styles.courseTabText,
                selectedCourseId === course.id && styles.selectedCourseTabText,
              ]}
            >
              {course.code}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date picker for attendance view */}
      {viewMode === "attendance" && (
        <View style={styles.datePickerContainer}>
          <ThemedText style={styles.datePickerLabel}>Select Date:</ThemedText>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            mode="date"
          />
        </View>
      )}

      {/* Content based on view mode */}
      {!selectedCourseId ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Please select a course to view details
          </ThemedText>
        </View>
      ) : viewMode === "timetable" ? (
        // Timetable view
        <View style={styles.contentContainer}>
          <ThemedText style={styles.sectionTitle}>Class Schedule</ThemedText>

          {timetableLoading ? (
            <ActivityIndicator
              size="large"
              color={isDark ? "#ffffff" : "#000000"}
            />
          ) : !timetable || timetable.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No timetable entries found for this course
              </ThemedText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  // Show form to add timetable entry
                  Alert.alert(
                    "Add Timetable Entry",
                    "This would open a form to add a new timetable entry",
                  );
                }}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Timetable Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {timetable.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.timetableCard,
                    { backgroundColor: isDark ? "#333333" : "#ffffff" },
                  ]}
                >
                  <View style={styles.timetableHeader}>
                    <ThemedText style={styles.dayOfWeek}>
                      {DAYS_OF_WEEK[entry.dayOfWeek]}
                    </ThemedText>
                    <ThemedText style={styles.time}>
                      {entry.startTime} - {entry.endTime}
                    </ThemedText>
                  </View>

                  {entry.location && (
                    <ThemedText style={styles.location}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={isDark ? "#ffffff" : "#000000"}
                      />{" "}
                      {entry.location}
                    </ThemedText>
                  )}

                  <View style={styles.timetableActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#3b82f6" },
                      ]}
                      onPress={() => {
                        // Edit timetable entry
                        Alert.alert(
                          "Edit Timetable",
                          "This would open a form to edit this timetable entry",
                        );
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#ffffff"
                      />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#4ade80" },
                      ]}
                      onPress={() => {
                        // Take attendance for this class
                        setViewMode("attendance");
                      }}
                    >
                      <Ionicons
                        name="checkbox-outline"
                        size={16}
                        color="#ffffff"
                      />
                      <Text style={styles.actionButtonText}>
                        Take Attendance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  // Show form to add timetable entry
                  Alert.alert(
                    "Add Timetable Entry",
                    "This would open a form to add a new timetable entry",
                  );
                }}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Timetable Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      ) : (
        // Attendance view
        <View style={styles.contentContainer}>
          <ThemedText style={styles.sectionTitle}>
            Attendance for {format(selectedDate, "MMMM d, yyyy")}
          </ThemedText>

          {timetableLoading ? (
            <ActivityIndicator
              size="large"
              color={isDark ? "#ffffff" : "#000000"}
            />
          ) : !timetable || timetable.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No classes scheduled for this course
              </ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {timetable.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.attendanceCard,
                    { backgroundColor: isDark ? "#333333" : "#ffffff" },
                  ]}
                >
                  <View style={styles.attendanceHeader}>
                    <ThemedText style={styles.attendanceTitle}>
                      {DAYS_OF_WEEK[entry.dayOfWeek]} Class
                    </ThemedText>
                    <ThemedText style={styles.attendanceTime}>
                      {entry.startTime} - {entry.endTime}
                    </ThemedText>
                  </View>

                  {/* This would be a list of students to mark attendance */}
                  <View style={styles.studentList}>
                    <ThemedText style={styles.studentListTitle}>
                      Student Roster
                    </ThemedText>

                    {/* In a real app, this would be populated with actual students */}
                    <View style={styles.studentItem}>
                      <ThemedText style={styles.studentName}>
                        John Doe
                      </ThemedText>
                      <View style={styles.statusButtons}>
                        {ATTENDANCE_STATUS.map((status) => (
                          <TouchableOpacity
                            key={status.value}
                            style={[
                              styles.statusButton,
                              { backgroundColor: status.color },
                            ]}
                            onPress={() => {
                              // Record attendance for this student
                              handleRecordAttendance(
                                "student-id-1", // This would be the actual student ID
                                status.value,
                                entry.id,
                              );
                            }}
                          >
                            <Text style={styles.statusButtonText}>
                              {status.label.charAt(0)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.studentItem}>
                      <ThemedText style={styles.studentName}>
                        Jane Smith
                      </ThemedText>
                      <View style={styles.statusButtons}>
                        {ATTENDANCE_STATUS.map((status) => (
                          <TouchableOpacity
                            key={status.value}
                            style={[
                              styles.statusButton,
                              { backgroundColor: status.color },
                            ]}
                            onPress={() => {
                              // Record attendance for this student
                              handleRecordAttendance(
                                "student-id-2", // This would be the actual student ID
                                status.value,
                                entry.id,
                              );
                            }}
                          >
                            <Text style={styles.statusButtonText}>
                              {status.label.charAt(0)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  viewModeSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  viewModeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedViewModeTab: {
    backgroundColor: "#3b82f6",
  },
  viewModeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  selectedViewModeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  courseSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCourseTab: {
    backgroundColor: "#3b82f6",
  },
  courseTabText: {
    fontSize: 14,
  },
  selectedCourseTabText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  contentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  timetableCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timetableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayOfWeek: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
    marginBottom: 12,
  },
  timetableActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  attendanceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  attendanceTime: {
    fontSize: 14,
  },
  studentList: {
    marginTop: 8,
  },
  studentListTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  studentName: {
    fontSize: 14,
  },
  statusButtons: {
    flexDirection: "row",
  },
  statusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  statusButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
