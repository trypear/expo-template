import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const user = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"]?.tint ?? "#000",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="megaphone" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help Requests",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="help-circle" color={color} />
          ),
        }}
      />
      {(user as { role?: string })?.role === "admin" && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="settings" color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}
