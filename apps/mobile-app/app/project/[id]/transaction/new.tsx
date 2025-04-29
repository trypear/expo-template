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

export default function NewTransactionScreen() {
  const { id: projectId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<"INCOMING" | "OUTGOING">("OUTGOING");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.budget.createTransaction.mutationOptions({
      onSuccess: () => {
        if (typeof projectId === "string") {
          void queryClient.invalidateQueries(
            trpc.budget.getProjectTransactions.queryOptions({ projectId }),
          );
        }
        router.back();
      },
    }),
  );

  const handleDateChange = (
    event: DateTimeEvent,
    newDate: Date | undefined,
  ) => {
    if (event.type === "set" && newDate) {
      setDate(newDate);
    }
  };

  const handleSubmit = () => {
    if (!amount.trim() || typeof projectId !== "string") return;

    mutate({
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      projectId,
      date,
      type,
    });
  };

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      <ThemedText type="title">New Transaction</ThemedText>

      <View style={styles.form}>
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
          <ThemedText style={styles.label}>Type</ThemedText>
          <View style={styles.typeButtons}>
            <Button
              variant={type === "OUTGOING" ? "default" : "outline"}
              onPress={() => setType("OUTGOING")}
            >
              Expense
            </Button>
            <Button
              variant={type === "INCOMING" ? "default" : "outline"}
              onPress={() => setType("INCOMING")}
            >
              Income
            </Button>
          </View>
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
            placeholder="Transaction description"
            placeholderTextColor={Colors[colorScheme ?? "light"].secondaryText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Date</ThemedText>
          <DateTimePicker
            value={date}
            onChange={(event, newDate) =>
              handleDateChange(event as DateTimeEvent, newDate)
            }
            mode="date"
          />
        </View>

        <View style={styles.buttons}>
          <Button onPress={() => router.back()} variant="outline">
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={!amount.trim() || isPending}
            variant="default"
          >
            {isPending ? "Creating..." : "Create Transaction"}
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
  typeButtons: {
    flexDirection: "row",
    gap: 12,
  },
});
