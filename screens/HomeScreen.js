import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCache, getCache } from "../utils/cache";
import { THEME } from "../constants/theme";
import { LEAGUES } from "../utils/footballData";
import { SafeCrest } from "../components/SafeImage";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";
const COMPETITIONS = "PL,PD,BL1,SA,FL1";

export default function HomeScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("All"); // All, Live, Completed, Upcoming
  const [selectedLeague, setSelectedLeague] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // -1 (Yesterday), 0 (Today), 1 (Tomorrow), 2, 3

  const [matches, setMatches] = useState({
    live: [],
    completed: [],
    upcoming: [],
    all: [],
  });
  const [pinnedMatchIds, setPinnedMatchIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Pulse animation for live indicators
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Load pinned matches from AsyncStorage
  useEffect(() => {
    const loadPinned = async () => {
      try {
        const stored = await AsyncStorage.getItem("redcard_pinned_matches");
        if (stored) setPinnedMatchIds(JSON.parse(stored));
      } catch (err) {
        console.log("Error loading pinned matches:", err);
      }
    };
    loadPinned();
  }, []);

  const togglePinMatch = async (matchId) => {
    const next = pinnedMatchIds.includes(matchId)
      ? pinnedMatchIds.filter((id) => id !== matchId)
      : [...pinnedMatchIds, matchId];
    setPinnedMatchIds(next);
    try {
      await AsyncStorage.setItem("redcard_pinned_matches", JSON.stringify(next));
    } catch (err) {
      console.log("Error saving pinned matches:", err);
    }
  };

  const formatDateTime = (utcDate) => {
    const d = new Date(utcDate);
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const time = `${hours}:${minutes} ${ampm}`;
    return { dayName, date, time, rawDate: d.toISOString() };
  };

  const fetchMatches = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError("");

      const cached = await getCache("all_matches_v2");
      if (cached && !refreshing) {
        setMatches(cached);
        setLoading(false);
      }

      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);

      const dateFrom = pastDate.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 4);
      const futureTo = futureDate.toISOString().split("T")[0];

      // Fetch fixtures & results
      const [upcomingRes, completedRes] = await Promise.all([
        fetch(
          `https://api.football-data.org/v4/matches?competitions=${COMPETITIONS}&dateFrom=${dateTo}&dateTo=${futureTo}`,
          { headers: { "X-Auth-Token": API_KEY } },
        ),
        fetch(
          `https://api.football-data.org/v4/matches?competitions=${COMPETITIONS}&status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
          { headers: { "X-Auth-Token": API_KEY } },
        ),
      ]);

      if (!upcomingRes.ok && !completedRes.ok) {
        throw new Error("Unable to load matches");
      }

      const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { matches: [] };
      const completedData = completedRes.ok ? await completedRes.json() : { matches: [] };

      const live = [];
      const completed = [];
      const upcoming = [];
      const LIVE_STATUSES = ["IN_PLAY", "PAUSED", "LIVE", "EXTRA_TIME", "PENALTY_SHOOTOUT"];

      (upcomingData.matches || []).forEach((m) => {
        const { date, time, rawDate } = formatDateTime(m.utcDate);
        const matchObj = {
          id: m.id || `${m.homeTeam?.id}-${m.awayTeam?.id}-${m.utcDate}`,
          home: m.homeTeam?.shortName || m.homeTeam?.name || "Home",
          away: m.awayTeam?.shortName || m.awayTeam?.name || "Away",
          homeLogo: { uri: m.homeTeam?.crest },
          awayLogo: { uri: m.awayTeam?.crest },
          homeId: m.homeTeam?.id,
          awayId: m.awayTeam?.id,
          competition: m.competition?.name || "League",
          competitionCode: m.competition?.code || "PL",
          competitionEmblem: m.competition?.emblem,
          utcDate: m.utcDate,
          rawDate,
          venue: m.venue || "Stadium",
          matchday: m.matchday,
        };

        if (LIVE_STATUSES.includes(m.status)) {
          matchObj.score = `${m.score?.fullTime?.home ?? 0} - ${m.score?.fullTime?.away ?? 0}`;
          matchObj.status = "Live";
          matchObj.minute = m.minute ? `${m.minute}'` : "LIVE";
          live.push(matchObj);
        } else {
          matchObj.date = date;
          matchObj.time = time;
          matchObj.status = "Upcoming";
          upcoming.push(matchObj);
        }
      });

      (completedData.matches || [])
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .forEach((m) => {
          const { date, time, rawDate } = formatDateTime(m.utcDate);
          completed.push({
            id: m.id || `${m.homeTeam?.id}-${m.awayTeam?.id}-${m.utcDate}`,
            home: m.homeTeam?.shortName || m.homeTeam?.name || "Home",
            away: m.awayTeam?.shortName || m.awayTeam?.name || "Away",
            homeLogo: { uri: m.homeTeam?.crest },
            awayLogo: { uri: m.awayTeam?.crest },
            homeId: m.homeTeam?.id,
            awayId: m.awayTeam?.id,
            competition: m.competition?.name || "League",
            competitionCode: m.competition?.code || "PL",
            competitionEmblem: m.competition?.emblem,
            utcDate: m.utcDate,
            rawDate,
            score: `${m.score?.fullTime?.home ?? 0} - ${m.score?.fullTime?.away ?? 0}`,
            status: "Full-Time",
            date,
            time,
            venue: m.venue || "Stadium",
            matchday: m.matchday,
          });
        });

      const allMatches = [...live, ...upcoming, ...completed];
      const result = { live, completed, upcoming, all: allMatches };

      setMatches(result);
      await setCache("all_matches_v2", result);
    } catch (err) {
      console.log("Match Fetch Error:", err);
      if (!matches.all.length) {
        setError("Unable to connect to live football feed. Tap to retry.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Auto-poll live scores every 60 seconds
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  // Day Selector Options
  const dayOptions = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = -1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      let label = "";
      if (i === -1) label = "Yesterday";
      else if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      else label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

      days.push({ offset: i, label, dateString: d.toISOString().split("T")[0] });
    }
    return days;
  }, []);

  // Filtered Matches based on tab, league, day, search
  const filteredMatches = useMemo(() => {
    let list = [];
    if (selectedTab === "Live") list = matches.live;
    else if (selectedTab === "Completed") list = matches.completed;
    else if (selectedTab === "Upcoming") list = matches.upcoming;
    else list = matches.all;

    // Filter by League
    if (selectedLeague !== "ALL") {
      list = list.filter((m) => m.competitionCode === selectedLeague);
    }

    // Filter by Date when on All, Completed or Upcoming tab (Live matches always show when relevant)
    if (selectedTab !== "Live" && selectedDayOffset !== null) {
      const targetDate = dayOptions.find((d) => d.offset === selectedDayOffset)?.dateString;
      if (targetDate) {
        list = list.filter((m) => {
          if (!m.utcDate) return true;
          return m.utcDate.startsWith(targetDate);
        });
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.home?.toLowerCase().includes(q) ||
          m.away?.toLowerCase().includes(q) ||
          m.competition?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [matches, selectedTab, selectedLeague, selectedDayOffset, searchQuery, dayOptions]);

  // Pinned Matches
  const pinnedMatches = useMemo(() => {
    return matches.all.filter((m) => pinnedMatchIds.includes(m.id));
  }, [matches.all, pinnedMatchIds]);

  // Spotlight / Match Pulse Match
  const spotlightMatch = matches.live[0] || matches.upcoming[0] || matches.completed[0];

  const renderSpotlightBanner = () => {
    if (!spotlightMatch) return null;

    const isLive = spotlightMatch.status === "Live";

    return (
      <View style={styles.spotlightContainer}>
        <LinearGradient
          colors={
            isLive
              ? ["#2a0d14", "#181015", "#121620"]
              : ["#142417", "#0e1815", "#101622"]
          }
          style={styles.spotlightCard}
        >
          <View style={styles.spotlightTopRow}>
            <View style={styles.spotlightBadge}>
              {isLive ? (
                <>
                  <Animated.View style={[styles.pulseRedDot, { opacity: pulseAnim }]} />
                  <Text style={styles.spotlightLiveText}>MATCH PULSE • LIVE NOW</Text>
                </>
              ) : (
                <Text style={styles.spotlightFeaturedText}>FEATURED SHOWDOWN</Text>
              )}
            </View>
            <Text style={styles.spotlightComp}>{spotlightMatch.competition}</Text>
          </View>

          <View style={styles.spotlightMatchRow}>
            <View style={styles.spotlightTeam}>
              <SafeCrest source={spotlightMatch.homeLogo} name={spotlightMatch.home} size={48} />
              <Text style={styles.spotlightTeamName} numberOfLines={1}>
                {spotlightMatch.home}
              </Text>
            </View>

            <View style={styles.spotlightScoreBox}>
              {spotlightMatch.score ? (
                <Text style={styles.spotlightScore}>{spotlightMatch.score}</Text>
              ) : (
                <View style={styles.spotlightTimeBox}>
                  <Text style={styles.spotlightTimeText}>{spotlightMatch.time}</Text>
                  <Text style={styles.spotlightDateText}>{spotlightMatch.date}</Text>
                </View>
              )}
              <Text style={styles.spotlightStatusText}>
                {isLive ? "Second Half" : spotlightMatch.status}
              </Text>
            </View>

            <View style={styles.spotlightTeam}>
              <SafeCrest source={spotlightMatch.awayLogo} name={spotlightMatch.away} size={48} />
              <Text style={styles.spotlightTeamName} numberOfLines={1}>
                {spotlightMatch.away}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.spotlightActionBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MatchDetails", { match: spotlightMatch })}
          >
            <Text style={styles.spotlightActionText}>Enter Match Centre</Text>
            <Ionicons name="arrow-forward" size={16} color="#080a0f" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderMatchCard = (match) => {
    const isLive = match.status === "Live";
    const isPinned = pinnedMatchIds.includes(match.id);

    return (
      <TouchableOpacity
        key={match.id}
        activeOpacity={0.82}
        style={styles.cardWrapper}
        onPress={() => navigation.navigate("MatchDetails", { match })}
      >
        <LinearGradient
          colors={
            isLive
              ? ["rgba(255, 42, 68, 0.12)", "rgba(22, 28, 40, 0.85)"]
              : ["rgba(255, 255, 255, 0.07)", "rgba(16, 22, 32, 0.75)"]
          }
          style={[styles.card, isLive && styles.liveCardBorder]}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardLeagueTag}>
              <Text style={styles.leagueTagText}>{match.competition}</Text>
            </View>

            <View style={styles.cardStatusRow}>
              {isLive ? (
                <View style={styles.liveTagContainer}>
                  <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
                  <Text style={styles.liveTagText}>{match.minute || "LIVE"}</Text>
                </View>
              ) : match.status === "Full-Time" ? (
                <View style={styles.ftTagContainer}>
                  <Text style={styles.ftTagText}>FT</Text>
                </View>
              ) : (
                <View style={styles.upcomingTagContainer}>
                  <Text style={styles.upcomingTagText}>{match.time}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => togglePinMatch(match.id)}
                style={styles.pinButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isPinned ? "star" : "star-outline"}
                  size={16}
                  color={isPinned ? THEME.colors.primary : "rgba(255,255,255,0.4)"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Teams and Score */}
          <View style={styles.cardBody}>
            {/* Home Team */}
            <View style={styles.cardTeam}>
              <SafeCrest source={match.homeLogo} name={match.home} size={30} style={{ marginBottom: 4 }} />
              <Text style={styles.teamName} numberOfLines={1}>
                {match.home}
              </Text>
            </View>

            {/* Score / Time Center */}
            <View style={styles.cardCenter}>
              {match.score ? (
                <Text style={[styles.scoreValue, isLive && styles.liveScoreValue]}>
                  {match.score}
                </Text>
              ) : (
                <View style={styles.vsBox}>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.dateSubText}>{match.date?.split("/").slice(0, 2).join("/")}</Text>
                </View>
              )}
            </View>

            {/* Away Team */}
            <View style={styles.cardTeam}>
              <SafeCrest source={match.awayLogo} name={match.away} size={30} style={{ marginBottom: 4 }} />
              <Text style={styles.teamName} numberOfLines={1}>
                {match.away}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Ionicons name="football" size={18} color={THEME.colors.primary} />
          </View>
          <Text style={styles.brandTitle}>
            MATCH <Text style={styles.brandAccent}>CENTRE</Text>
          </Text>
        </View>

        <View style={styles.navbarActions}>
          {matches.live.length > 0 && (
            <View style={styles.liveCounterBadge}>
              <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveCounterText}>{matches.live.length} LIVE</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.navIconButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name={showSearch ? "close" : "search"} size={19} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIconButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar Collapsible */}
      {showSearch && (
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search teams or leagues..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Date Ribbon */}
      <View style={styles.dateRibbonContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRibbonContent}
        >
          {dayOptions.map((day) => {
            const isSelected = selectedDayOffset === day.offset;
            return (
              <TouchableOpacity
                key={day.offset}
                style={[styles.datePill, isSelected && styles.activeDatePill]}
                onPress={() => setSelectedDayOffset(day.offset)}
              >
                <Text style={[styles.datePillText, isSelected && styles.activeDatePillText]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Segment Tabs: All, Live, Completed, Upcoming */}
      <View style={styles.segmentContainer}>
        {["All", "Live", "Completed", "Upcoming"].map((tab) => {
          const isSelected = selectedTab === tab;
          const liveCount = tab === "Live" ? matches.live.length : null;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.segmentBtnText, isSelected && styles.activeSegmentBtnText]}>
                {tab}
                {liveCount > 0 ? ` (${liveCount})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* League Filter Pills Carousel */}
      <View style={styles.leagueCarouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leagueCarouselContent}
        >
          {LEAGUES.map((league) => {
            const isSelected = selectedLeague === league.id;
            const iconColor = isSelected ? "#080a0f" : THEME.colors.primary;

            return (
              <TouchableOpacity
                key={league.id}
                style={[styles.leaguePill, isSelected && styles.activeLeaguePill]}
                onPress={() => setSelectedLeague(league.id)}
                activeOpacity={0.8}
              >
                {league.iconFamily === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons
                    name={league.icon}
                    size={15}
                    color={iconColor}
                    style={{ marginRight: 6 }}
                  />
                ) : (
                  <Ionicons
                    name={league.icon}
                    size={15}
                    color={iconColor}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.leaguePillText, isSelected && styles.activeLeaguePillText]}>
                  {league.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Syncing live pitch data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.colors.primary}
            />
          }
        >
          {/* Spotlight Hero Card */}
          {selectedTab === "All" && !searchQuery && renderSpotlightBanner()}

          {/* Pinned Matches Section */}
          {pinnedMatches.length > 0 && !searchQuery && (
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeadingLeft}>
                <Ionicons name="star" size={16} color={THEME.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.sectionHeadingTitle}>PINNED MATCHES</Text>
              </View>
              <Text style={styles.sectionHeadingSub}>{pinnedMatches.length} tracked</Text>
            </View>
          )}
          {pinnedMatches.length > 0 && !searchQuery && pinnedMatches.map(renderMatchCard)}

          {/* Section Divider */}
          {pinnedMatches.length > 0 && !searchQuery && <View style={styles.sectionDivider} />}

          {/* Filtered Matches List */}
          {filteredMatches.length > 0 ? (
            filteredMatches.map(renderMatchCard)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="soccer" size={54} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyTitle}>
                {selectedTab === "Live"
                  ? "No live fixtures right now"
                  : "No matches found"}
              </Text>
              <Text style={styles.emptySub}>
                {selectedTab === "Live"
                  ? "Check upcoming matches or change your date filter."
                  : "Try selecting another league, date, or clearing search."}
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={onRefresh}>
                <Text style={styles.emptyBtnText}>Refresh Fixtures</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 54 : 45,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 42, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  redCardIcon: {
    width: 14,
    height: 18,
    borderRadius: 2,
    backgroundColor: THEME.colors.redCard,
    transform: [{ rotate: "8deg" }],
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: THEME.colors.redCard,
  },
  navbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveCounterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 42, 68, 0.2)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.35)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.redCard,
    marginRight: 6,
  },
  liveCounterText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.redCard,
    letterSpacing: 0.4,
  },
  navIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    marginHorizontal: 18,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchBarInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 4,
  },
  dateRibbonContainer: {
    paddingVertical: 6,
  },
  dateRibbonContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  datePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  activeDatePill: {
    backgroundColor: THEME.colors.primary,
  },
  datePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeDatePillText: {
    color: "#080a0f",
    fontWeight: "800",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 18,
    marginTop: 6,
    padding: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 13,
  },
  activeSegmentBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  activeSegmentBtnText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  leagueCarouselContainer: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  leagueCarouselContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  leaguePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  activeLeaguePill: {
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    borderColor: THEME.colors.primary,
  },
  leagueFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  leaguePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeLeaguePillText: {
    color: THEME.colors.primary,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 130,
  },
  spotlightContainer: {
    marginBottom: 16,
  },
  spotlightCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  spotlightTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  spotlightBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.redCard,
    marginRight: 6,
  },
  spotlightLiveText: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.colors.redCard,
    letterSpacing: 0.5,
  },
  spotlightFeaturedText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  spotlightComp: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  spotlightMatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  spotlightTeam: {
    flex: 1,
    alignItems: "center",
  },
  spotlightLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  spotlightTeamName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
  },
  spotlightScoreBox: {
    alignItems: "center",
    minWidth: 100,
  },
  spotlightScore: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  spotlightTimeBox: {
    alignItems: "center",
  },
  spotlightTimeText: {
    fontSize: 19,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  spotlightDateText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  spotlightStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
  },
  spotlightActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
  },
  spotlightActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080a0f",
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  liveCardBorder: {
    borderColor: "rgba(255, 42, 68, 0.4)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLeagueTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  leagueTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  cardStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 42, 68, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.colors.redCard,
  },
  ftTagContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ftTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
  },
  upcomingTagContainer: {
    backgroundColor: "rgba(215, 252, 90, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upcomingTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  pinButton: {
    padding: 2,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTeam: {
    flex: 1,
    alignItems: "center",
  },
  teamLogo: {
    width: 44,
    height: 44,
  },
  teamName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 6,
    textAlign: "center",
  },
  cardCenter: {
    alignItems: "center",
    minWidth: 80,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1.5,
  },
  liveScoreValue: {
    color: "#ffffff",
  },
  vsBox: {
    alignItems: "center",
  },
  vsText: {
    fontSize: 14,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.35)",
  },
  dateSubText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.45)",
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeadingTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.primary,
    letterSpacing: 0.8,
  },
  sectionHeadingSub: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.45)",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#080a0f",
    fontWeight: "800",
    fontSize: 13,
  },
});
