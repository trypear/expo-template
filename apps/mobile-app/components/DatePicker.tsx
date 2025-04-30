import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { platform } from "@/hooks/getPlatform";
import DateTimePicker from "@react-native-community/datetimepicker";

import { assert } from "@acme/utils";

interface DateTimeEvent {
  type: "set" | "dismissed";
  nativeEvent: {
    timestamp?: number;
  };
}

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
}

/**
 * DatePicker component that uses the native datetimepicker on iOS/Android
 * and switches to a web-compatible alternative on web platforms
 */
export default function DatePicker({
  value,
  onChange,
  mode = "date",
  label,
  minimumDate,
  maximumDate,
  className,
}: DatePickerProps) {
  const [show, setShow] = useState(false);

  // Format date for display
  const formatDate = (date: Date): string => {
    if (mode === "date") {
      return date.toLocaleDateString();
    } else if (mode === "time") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleString();
    }
  };

  // Handle date change for native picker
  const handleDateChange = (
    event: DateTimeEvent,
    selectedDate: Date | undefined,
  ) => {
    setShow(false);
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  // Handle date change for web picker
  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    assert(!!e.target.value, "Input value is required");
    const selectedDate = new Date(e.target.value);
    assert(!isNaN(selectedDate.getTime()), "Invalid date");
    onChange(selectedDate);
  };

  // Format date for web input
  const formatForWebInput = (date: Date): string => {
    if (mode === "date") {
      const datePart = date.toISOString().split("T")[0];
      assert(!!datePart, "Invalid date format");
      return datePart;
    } else if (mode === "time") {
      const timePart = date.toISOString().split("T")[1];
      assert(!!timePart, "Invalid time format");
      return timePart.substring(0, 5);
    } else {
      const isoString = date.toISOString();
      const dateStr = isoString.split(".")[0];
      assert(!!dateStr, "Invalid datetime format");
      return dateStr.substring(0, dateStr.length - 3);
    }
  };

  // Get input type for web
  const getWebInputType = (): string => {
    if (mode === "date") return "date";
    if (mode === "time") return "time";
    return "datetime-local";
  };

  return (
    <View className={`${className}`}>
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      )}

      {platform === "web" ? (
        // Web implementation
        <View className="relative">
          <input
            type={getWebInputType()}
            value={formatForWebInput(value)}
            onChange={handleWebDateChange}
            min={minimumDate ? formatForWebInput(minimumDate) : undefined}
            max={maximumDate ? formatForWebInput(maximumDate) : undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </View>
      ) : (
        // iOS/Android implementation
        <>
          <TouchableOpacity
            onPress={() => setShow(true)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <Text>{formatDate(value)}</Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={value}
              mode={mode}
              onChange={(event, selectedDate) =>
                handleDateChange(event as DateTimeEvent, selectedDate)
              }
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
}
