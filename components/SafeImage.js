import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "../constants/theme";

/**
 * Sanitizes an image URI:
 * React Native <Image> on Android crashes or fails when given an SVG URL.
 * football-data.org SVG crests have direct PNG counterparts at https://crests.football-data.org/{id}.png
 */
export function sanitizeCrestUri(uri) {
  if (!uri || typeof uri !== "string") return null;
  const trimmed = uri.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;

  // Convert football-data.org .svg to .png
  if (trimmed.includes("crests.football-data.org") && trimmed.endsWith(".svg")) {
    return trimmed.replace(".svg", ".png");
  }

  // Other SVGs cannot be decoded by native Fresco on Android without react-native-svg
  if (trimmed.endsWith(".svg")) {
    return null;
  }

  return trimmed;
}

/**
 * Safe Crest Image with automatic fallback to sleek initials shield
 */
export function SafeCrest({ source, name = "Club", size = 32, style }) {
  const [hasError, setHasError] = useState(false);

  const rawUri = typeof source === "object" && source ? source.uri : typeof source === "string" ? source : null;
  const cleanUri = sanitizeCrestUri(rawUri);

  // Generate initials (e.g., "Arsenal" -> "ARS", "Manchester City" -> "MC")
  const initials = (name || "FC")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  if (!cleanUri || hasError) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <LinearGradientPlaceholder size={size} initials={initials} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: cleanUri }}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
}

function LinearGradientPlaceholder({ size, initials }) {
  const fontSize = Math.max(9, Math.round(size * 0.36));
  return (
    <View style={[styles.crestFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.crestInitials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

/**
 * Safe Player Face Image with automatic fallback to jersey number or initials
 */
export function SafePlayerFace({
  uri,
  name = "Player",
  number,
  size = 40,
  style,
  borderColor = "#d7fc5a",
}) {
  const [hasError, setHasError] = useState(false);

  const cleanUri = uri && typeof uri === "string" && !uri.endsWith(".svg") ? uri.trim() : null;

  const initials = (name || "P")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const label = number ? String(number) : initials;
  const fontSize = Math.max(10, Math.round(size * 0.36));

  if (!cleanUri || hasError) {
    return (
      <View
        style={[
          styles.playerFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor,
          },
          style,
        ]}
      >
        <Text style={[styles.playerFallbackText, { fontSize }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.playerImageContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: cleanUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
        onError={() => setHasError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  crestFallback: {
    backgroundColor: "#162032",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  crestInitials: {
    fontWeight: "900",
    color: "#d7fc5a",
  },
  playerImageContainer: {
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: "#121926",
    alignItems: "center",
    justifyContent: "center",
  },
  playerFallback: {
    borderWidth: 2,
    backgroundColor: "#162032",
    alignItems: "center",
    justifyContent: "center",
  },
  playerFallbackText: {
    fontWeight: "900",
    color: "#fff",
  },
});

