import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { setCache, getCache } from "../utils/cache";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const HomeScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Live");
  const [matches, setMatches] = useState({
    live: [],
    completed: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const LEAGUES = "PL,PD,BL1,SA,FL1";

  const formatDateTime = (utcDate) => {
    const d = new Date(utcDate);
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const time = `${hours}:${minutes} ${ampm}`;
    return { date, time };
  };

  const fetchMatches = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError("");

      const cached = await getCache("all_matches");
      if (cached) {
        setMatches(cached);
        setLoading(false);
        return;
      }

      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);

      const dateFrom = pastDate.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 3);
      const futureTo = futureDate.toISOString().split("T")[0];
      const upcoming_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&dateFrom=${dateTo}&dateTo=${futureTo}`,
        { headers: { "X-Auth-Token": API_KEY } },
      );
      if (!upcoming_res.ok) throw new Error("Unable to load fixtures");

      const upcoming_data = await upcoming_res.json();
      const completed_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": API_KEY } },
      );
      if (!completed_res.ok) throw new Error("Unable to load results");

      const completed_data = await completed_res.json();
      const live = [];
      const completed = [];
      const upcoming = [];
      const LIVE_STATUSES = [
        "IN_PLAY",
        "PAUSED",
        "LIVE",
        "EXTRA_TIME",
        "PENALTY_SHOOTOUT",
      ];
      upcoming_data.matches.forEach((m) => {
        const { date, time } = formatDateTime(m.utcDate);

        const obj = {
          home: m.homeTeam.shortName || m.homeTeam.name,
          away: m.awayTeam.shortName || m.awayTeam.name,
          homeLogo: { uri: m.homeTeam.crest },
          awayLogo: { uri: m.awayTeam.crest },
        };

        if (LIVE_STATUSES.includes(m.status)) {
          obj.score = `${m.score.fullTime.home ?? 0} - ${
            m.score.fullTime.away ?? 0
          }`;
          obj.status = "Live";
          live.push(obj);
        } else {
          obj.date = date;
          obj.time = time;
          upcoming.push(obj);
        }
      });
      completed_data.matches
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .forEach((m) => {
          completed.push({
            home: m.homeTeam.shortName || m.homeTeam.name,
            away: m.awayTeam.shortName || m.awayTeam.name,
            homeLogo: { uri: m.homeTeam.crest },
            awayLogo: { uri: m.awayTeam.crest },
            score: `${m.score.fullTime.home} - ${m.score.fullTime.away}`,
            status: "Full-Time",
            date: m.utcDate.split("T")[0],
          });
        });

      const all = { live, completed, upcoming };

      setMatches(all);
      await setCache("all_matches", all);
    } catch (err) {
      console.log("Match Fetch Error", err);
      setError(
        "We couldn't load matches. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const current =
    selectedTab === "Live"
      ? matches.live
      : selectedTab === "Completed"
        ? matches.completed
        : matches.upcoming;

  const pulseMatch =
    matches.live[0] || matches.upcoming[0] || matches.completed[0];
  const pulse =
    matches.live.length > 0
      ? {
          eyebrow: "LIVE NOW",
          title: `${matches.live.length} match${matches.live.length === 1 ? " is" : "es are"} unfolding`,
          description: "Stay close to the moments that can change the table.",
        }
      : matches.upcoming.length > 0
        ? {
            eyebrow: "NEXT UP",
            title: `${matches.upcoming[0].home} meet ${matches.upcoming[0].away}`,
            description: `${matches.upcoming[0].date} at ${matches.upcoming[0].time}. Your next football window starts here.`,
          }
        : {
            eyebrow: "MATCH PULSE",
            title: "The pitch is quiet for now",
            description:
              "Pull to refresh and we will bring the next story to you.",
          };

  const renderPulse = () => (
    <View style={styles.pulseSection}>
      <View style={styles.pulseHeader}>
        <View>
          <Text style={styles.pulseEyebrow}>{pulse.eyebrow}</Text>
          <Text style={styles.pulseHeading}>Match Pulse</Text>
        </View>
        <View style={styles.pulseDot} />
      </View>
      <Text style={styles.pulseTitle}>{pulse.title}</Text>
      <Text style={styles.pulseDescription}>{pulse.description}</Text>
      {pulseMatch && (
        <TouchableOpacity
          style={styles.pulseAction}
          onPress={() =>
            navigation.navigate("MatchDetails", { match: pulseMatch })
          }
        >
          <Text style={styles.pulseActionText}>Open match centre</Text>
          <Text style={styles.pulseArrow}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#d7fc5a" />
        </View>
      );
    }

    if (error && current.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noMatchesText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedTab === "Live" && current.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noMatchesText}>
            No live matches right now. Check back soon!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d7fc5a"
          />
        }
      >
        {current.map((match, i) => (
          <TouchableOpacity
            key={`${match.home}-${match.away}-${match.date || match.status}-${i}`}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MatchDetails", { match })}
          >
            <View style={styles.card}>
              <View style={styles.teamContainer}>
                <Image source={match.homeLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.home}</Text>
              </View>

              <View style={styles.centerContent}>
                {match.time ? (
                  <>
                    <Text style={styles.dateText}>{match.date}</Text>
                    <Text style={styles.timeText}>{match.time}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scoreText}>{match.score}</Text>
                    <Text style={styles.statusText}>{match.status}</Text>
                  </>
                )}
              </View>

              <View style={styles.teamContainer}>
                <Image source={match.awayLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.away}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1 }}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Watch Matches</Text>
      </View>

      <View style={styles.segmentContainer}>
        {["Completed", "Live", "Upcoming"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.segmentButton,
              selectedTab === tab && styles.activeSegmentButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.segmentText,
                selectedTab === tab && styles.activeSegmentText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderPulse()}
      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  loaderWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 130,
  },
  noMatchesText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: "#d7fc5a",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },
  retryText: { color: "#000", fontWeight: "800" },
  headerContainer: { marginTop: 65, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },

  segmentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 25,
  },
  segmentButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  activeSegmentButton: { backgroundColor: "#d7fc5a", borderColor: "#d7fc5a" },
  segmentText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  activeSegmentText: { color: "#000", fontWeight: "700" },

  pulseSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#d7fc5a",
  },
  pulseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pulseEyebrow: {
    color: "rgba(15,15,13,0.65)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  pulseHeading: {
    color: "#0f0f0d",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    marginTop: 3,
  },
  pulseTitle: {
    color: "#0f0f0d",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    marginTop: 22,
  },
  pulseDescription: {
    color: "rgba(15,15,13,0.7)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
  pulseAction: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 17,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#0f0f0d",
  },
  pulseActionText: { color: "#d7fc5a", fontSize: 13, fontWeight: "800" },
  pulseArrow: { color: "#d7fc5a", fontSize: 20, lineHeight: 16, marginLeft: 6 },

  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
  },

  teamContainer: { flex: 1, alignItems: "center" },
  centerContent: { alignItems: "center", minWidth: 100 },
  logo: { width: 60, height: 60, resizeMode: "contain" },
  teamName: {
    color: "#fff",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  dateText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  timeText: { color: "#d7fc5a", fontSize: 20, fontWeight: "800", marginTop: 6 },
  scoreText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  statusText: { color: "rgba(255,255,255,0.7)", marginTop: 6 },
});

export default HomeScreen;
