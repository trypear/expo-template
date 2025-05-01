import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { HapticTab } from "@/components/HapticTab";
import { Icon } from "@/components/ui/Icons";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarItemStyle: {
          padding: 5,
          margin: 0,
          height: "100%",
        },
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            bottom: 0,
            marginBottom: 0,
            paddingBottom: 0,
            height: 65,
            overflow: "hidden",
          },
          default: {
            marginBottom: 0,
            paddingBottom: 0,
            height: 45,
            overflow: "hidden",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="house" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="notes" color={color} />
          ),
          title: "Notes",
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="settings" color={color} />
          ),
          title: "",
        }}
      />
    </Tabs>
  );
}
