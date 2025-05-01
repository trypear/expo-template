import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const statusColors = {
  present: "#4ade80", // green
  absent: "#f87171", // red
  late: "#facc15", // yellow
  excused: "#93c5fd", // blue
};

const statusIcons = {
  present: "checkmark-circle",
  absent: "close-circle",
  late: "time",
  excused: "medical",
};

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useUser();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Get student courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    ...trpc.attendance.getStudentCourses.queryOptions(),
    enabled: !!user,
  });

  // Get attendance records for the selected course
  const { data: attendanceRecords, isLoading: attendanceLoading } = useQuery({
    ...trpc.attendance.getStudentAttendance.queryOptions({
      courseId: selectedCourseId ?? undefined,
    }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>
          Please log in to view your attendance
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
          You are not enrolled in any courses yet.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Attendance</ThemedText>

      {/* Course selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.courseSelector}
      >
        <TouchableOpacity
          style={[
            styles.courseTab,
            !selectedCourseId && styles.selectedCourseTab,
            { backgroundColor: isDark ? "#333333" : "#f3f4f6" },
          ]}
          onPress={() => setSelectedCourseId(null)}
        >
          <ThemedText
            style={[
              styles.courseTabText,
              !selectedCourseId && styles.selectedCourseTabText,
            ]}
          >
            All Courses
          </ThemedText>
        </TouchableOpacity>

        {courses?.map((course) => (
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

      {/* Attendance records */}
      {attendanceLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#ffffff" : "#000000"}
          />
        </View>
      ) : !attendanceRecords || attendanceRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No attendance records found
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.recordsContainer}>
          {attendanceRecords?.map((record) => (
            <View
              key={record.id}
              style={[
                styles.recordCard,
                { backgroundColor: isDark ? "#333333" : "#ffffff" },
              ]}
            >
              <View style={styles.recordHeader}>
                <ThemedText style={styles.courseName}>
                  {record.courseCode}
                </ThemedText>
                <ThemedText style={styles.date}>
                  {format(new Date(record.date), "MMM dd, yyyy")}
                </ThemedText>
              </View>

              <View style={styles.recordDetails}>
                <View style={styles.timeLocation}>
                  <ThemedText style={styles.time}>
                    {record.startTime} - {record.endTime}
                  </ThemedText>
                  {record.location && (
                    <ThemedText style={styles.location}>
                      {record.location}
                    </ThemedText>
                  )}
                </View>

                {record.status && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          statusColors[record.status as AttendanceStatus],
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        statusIcons[
                          record.status as AttendanceStatus
                        ] as keyof typeof Ionicons.glyphMap
                      }
                      size={16}
                      color="#ffffff"
                    />
                    <Text style={styles.statusText}>
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>

              {record.notes && (
                <ThemedText style={styles.notes}>{record.notes}</ThemedText>
              )}
            </View>
          ))}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  recordsContainer: {
    flex: 1,
  },
  recordCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
  },
  recordDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeLocation: {
    flex: 1,
  },
  time: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  notes: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
});
