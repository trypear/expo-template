import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import { ThemedText } from "../ThemedText";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: "default" | "outline" | "ghost";
  children: string;
  style?: StyleProp<ViewStyle>;
}

const baseStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

export function Button({
  variant = "default",
  children,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light";

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const colors = Colors[colorScheme];

    switch (variant) {
      case "default":
        return {
          backgroundColor: colors.btnColor,
          shadowColor: colors.cardBorder,
        };
      case "outline":
        return {
          backgroundColor: "transparernt",
          borderWidth: 1,
          borderColor: colors.btnColor,
        };
      case "ghost":
      default:
        return {
          backgroundColor: "transparent",
          borderColor: colors.btnColor,
        };
    }
  };

  const getTextStyle = () => {
    const colors = Colors[colorScheme];
    return {
      fontWeight: "600" as const,
      fontSize: 14,
      letterSpacing: 0.15,
      color:
        variant === "default"
          ? colors.btnText
          : variant === "ghost"
            ? colors.secondaryText
            : colors.tint,
    };
  };

  return (
    <Pressable
      style={(state) => [
        baseStyles.button,
        getButtonStyle(),
        state.pressed && baseStyles.pressed,
        style,
      ]}
      {...props}
    >
      <ThemedText style={getTextStyle()}>{children}</ThemedText>
    </Pressable>
  );
}
