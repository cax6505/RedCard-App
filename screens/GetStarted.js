import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { THEME } from "../constants/theme";

export default function GetStarted() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require("../assets/Messi.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(8, 10, 15, 0.2)",
            "rgba(8, 10, 15, 0.65)",
            "rgba(8, 10, 15, 0.95)",
            "#080a0f",
          ]}
          style={styles.gradient}
        >
          {/* Top Brand Tag */}
          <View style={styles.topBrandContainer}>
            <View style={styles.redCardIcon} />
            <Text style={styles.topBrandText}>
              RED<Text style={styles.brandAccent}>CARD</Text>
            </Text>
          </View>

          <View style={styles.content}>
            {/* Live Ticker Chip */}
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveChipText}>LIVE PITCH INTELLIGENCE</Text>
            </View>

            <Text style={styles.title}>
              Every Minute.{"\n"}
              Every Goal.{"\n"}
              <Text style={styles.titleAccent}>Real-Time Football.</Text>
            </Text>

            <Text style={styles.description}>
              Follow Europe's elite leagues with live match clocks, tactical lineups, head-to-head records, and instant score updates.
            </Text>

            {/* Feature Highlights Pills */}
            <View style={styles.featurePillsRow}>
              <View style={styles.featurePill}>
                <Ionicons name="flash" size={13} color={THEME.colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.featurePillText}>Live Scores</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="football" size={13} color={THEME.colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.featurePillText}>Tactical Pitch</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="stats-chart" size={13} color={THEME.colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.featurePillText}>Live Stats</Text>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={19} color="#080a0f" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080a0f" },
  background: { flex: 1, width: "100%", height: "100%" },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 64 : 50,
    paddingBottom: Platform.OS === "ios" ? 54 : 36,
  },
  topBrandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redCardIcon: {
    width: 14,
    height: 19,
    borderRadius: 2,
    backgroundColor: THEME.colors.redCard,
    transform: [{ rotate: "10deg" }],
  },
  topBrandText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  brandAccent: {
    color: THEME.colors.redCard,
  },
  content: {},
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 42, 68, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.35)",
    marginBottom: 14,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.redCard,
    marginRight: 6,
  },
  liveChipText: {
    fontSize: 10,
    fontWeight: "900",
    color: THEME.colors.redCard,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 40,
    letterSpacing: 0.3,
  },
  titleAccent: {
    color: THEME.colors.primary,
  },
  description: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 21,
    fontWeight: "500",
  },
  featurePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    marginTop: 26,
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    color: "#080a0f",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
