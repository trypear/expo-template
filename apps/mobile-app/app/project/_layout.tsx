import { Stack } from "expo-router";

export default function ProjectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Projects" />
    </Stack>
  );
}
