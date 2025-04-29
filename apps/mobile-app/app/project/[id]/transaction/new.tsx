import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { trpc } from "@/hooks/api";
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
    <ThemedView style={styles.container}>
      <ThemedText type="title">New Transaction</ThemedText>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#666"
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
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Transaction description"
            placeholderTextColor="#666"
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
          <Button onPress={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button onPress={handleSubmit} disabled={!amount.trim() || isPending}>
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
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
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
