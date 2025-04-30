import { Stack } from "expo-router";

export default function ProjectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="transaction/new"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
