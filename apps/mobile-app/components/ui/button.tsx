import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { ThemedText } from "../ThemedText";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: "default" | "outline" | "ghost";
  children: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = "default",
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={(state) => {
        const baseStyles = [
          styles.button,
          styles[variant],
          state.pressed && styles.pressed,
          style,
        ] as StyleProp<ViewStyle>[];
        return baseStyles.filter(Boolean);
      }}
      {...props}
    >
      <ThemedText
        style={[
          styles.text,
          variant === "ghost" && styles.ghostText,
          variant === "outline" && styles.outlineText,
        ]}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    backgroundColor: "#A1CEDC",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#A1CEDC",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: "#000000",
    fontWeight: "500",
  },
  outlineText: {
    color: "#A1CEDC",
  },
  ghostText: {
    color: "#A1CEDC",
  },
});
