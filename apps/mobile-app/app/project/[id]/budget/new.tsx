import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DateTimeEvent {
  type: "set" | "dismissed" | "neutralButtonPressed";
  nativeEvent: {
    timestamp?: number;
  };
}

export default function NewBudgetScreen() {
  const { id: projectId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.budget.createBudget.mutationOptions({
      onSuccess: () => {
        if (typeof projectId === "string") {
          void queryClient.invalidateQueries(
            trpc.budget.getProjectBudgets.queryOptions({ projectId }),
          );
        }
        router.back();
      },
    }),
  );

  const handleDateChange = (
    event: DateTimeEvent,
    date: Date | undefined,
    setter: (date: Date) => void,
  ) => {
    if (event.type === "set" && date) {
      setter(date);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount.trim() || typeof projectId !== "string") return;

    mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      projectId,
      startDate,
      endDate,
    });
  };

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      <ThemedText type="title">New Budget</ThemedText>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme ?? "light"].cardBackground,
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Budget name"
            placeholderTextColor={Colors[colorScheme ?? "light"].secondaryText}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme ?? "light"].cardBackground,
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={Colors[colorScheme ?? "light"].secondaryText}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Description (optional)</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: Colors[colorScheme ?? "light"].cardBackground,
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Budget description"
            placeholderTextColor={Colors[colorScheme ?? "light"].secondaryText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Start Date</ThemedText>
          <DateTimePicker
            value={startDate}
            onChange={(event, date) =>
              handleDateChange(event as DateTimeEvent, date, setStartDate)
            }
            mode="date"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>End Date (optional)</ThemedText>
          {endDate ? (
            <View style={styles.dateRow}>
              <DateTimePicker
                value={endDate}
                onChange={(event, date) =>
                  handleDateChange(event as DateTimeEvent, date, setEndDate)
                }
                mode="date"
                minimumDate={startDate}
              />
              <Button variant="ghost" onPress={() => setEndDate(undefined)}>
                Clear
              </Button>
            </View>
          ) : (
            <Button variant="outline" onPress={() => setEndDate(new Date())}>
              Set End Date
            </Button>
          )}
        </View>

        <View style={styles.buttons}>
          <Button onPress={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={!name.trim() || !amount.trim() || isPending}
          >
            {isPending ? "Creating..." : "Create Budget"}
          </Button>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
