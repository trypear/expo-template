import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { userPreferences } from "@/utils/mockData";

export default function SettingsScreen() {
  const router = useRouter();
  const [currency, setCurrency] = useState(userPreferences.currency);
  const [startOfMonth, setStartOfMonth] = useState(
    userPreferences.startOfMonth,
  );
  const [darkMode, setDarkMode] = useState(userPreferences.theme === "dark");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        {/* User Profile Section */}
        <ThemedView style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Icon name="user" size={32} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.profileName}>John Doe</ThemedText>
          <ThemedText style={styles.profileEmail}>
            john.doe@example.com
          </ThemedText>
        </ThemedView>

        {/* Preferences Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

          {/* Currency Setting */}
          <Pressable
            style={styles.settingItem}
            onPress={() => router.push("/currency-settings")}
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Currency</ThemedText>
              <ThemedText style={styles.settingValue}>{currency}</ThemedText>
            </View>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>

          {/* Start of Month Setting */}
          <Pressable
            style={styles.settingItem}
            onPress={() => router.push("/month-settings")}
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>
                Start of Month
              </ThemedText>
              <ThemedText style={styles.settingValue}>
                Day {startOfMonth}
              </ThemedText>
            </View>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>

          {/* Dark Mode Setting */}
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#5B65E9" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ThemedView>

        {/* Data Management Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Export Data</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Export your budget data as CSV
              </ThemedText>
            </View>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Import Data</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Import data from CSV file
              </ThemedText>
            </View>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>
        </ThemedView>

        {/* About Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>

          <Pressable style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Version</ThemedText>
            <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Privacy Policy</ThemedText>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>
              Terms of Service
            </ThemedText>
            <Icon name="settings" size={20} color="#5B65E9" />
          </Pressable>
        </ThemedView>

        {/* Sign Out Button */}
        <Pressable style={styles.signOutButton}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "rgba(91, 101, 233, 0.1)",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5B65E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  signOutText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
});
