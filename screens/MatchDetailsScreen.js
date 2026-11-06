import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MatchDetailsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const match = params?.match;

  if (!match) {
    return (
      <LinearGradient
        colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
        style={styles.screen}
      >
        <SafeAreaView style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Match unavailable</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isScheduled = Boolean(match.time);
  const status = match.status || "Upcoming";

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Centre</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.matchCard}>
            <Text style={styles.status}>
              {isScheduled ? "KICK-OFF" : status.toUpperCase()}
            </Text>
            {isScheduled ? (
              <>
                <Text style={styles.date}>{match.date}</Text>
                <Text style={styles.time}>{match.time}</Text>
              </>
            ) : (
              <Text style={styles.score}>{match.score || "-"}</Text>
            )}

            <View style={styles.teamsRow}>
              <View style={styles.team}>
                <Image source={match.homeLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.home}</Text>
              </View>
              <Text style={styles.vs}>VS</Text>
              <View style={styles.team}>
                <Image source={match.awayLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.away}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match updates</Text>
            <Text style={styles.mutedText}>
              Detailed events, lineups, and statistics will appear here when the
              data provider makes them available.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="calendar-outline" size={19} color="#0f0f0d" />
            <Text style={styles.primaryButtonText}>Back to matches</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerSpacer: { width: 42 },
  headerTitle: { color: "#fff", fontSize: 21, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 140 },
  matchCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.11)",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
  },
  status: {
    color: "#d7fc5a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  date: { color: "#fff", fontSize: 16, marginTop: 12 },
  time: { color: "#d7fc5a", fontSize: 32, fontWeight: "900", marginTop: 4 },
  score: { color: "#d7fc5a", fontSize: 36, fontWeight: "900", marginTop: 12 },
  teamsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
  },
  team: { width: "38%", alignItems: "center" },
  logo: { width: 70, height: 70, marginBottom: 12 },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  vs: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "800" },
  section: {
    marginTop: 22,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  mutedText: { color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 22 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d7fc5a",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 22,
  },
  primaryButtonText: { color: "#0f0f0d", fontWeight: "800", fontSize: 15 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
});
