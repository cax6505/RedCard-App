import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { TOP_SCORERS, TOP_ASSISTS } from "../utils/footballData";
import { getCache, setCache } from "../utils/cache";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const LEAGUES = [
  { id: "PL", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "England" },
  { id: "PD", name: "La Liga", flag: "🇪🇸", country: "Spain" },
  { id: "SA", name: "Serie A", flag: "🇮🇹", country: "Italy" },
  { id: "BL1", name: "Bundesliga", flag: "🇩🇪", country: "Germany" },
  { id: "FL1", name: "Ligue 1", flag: "🇫🇷", country: "France" },
];

export default function StandingsScreen() {
  const navigation = useNavigation();
  const [selectedLeague, setSelectedLeague] = useState("PL");
  const [activeTab, setActiveTab] = useState("Table"); // Table, Top Scorers, Top Assists
  const [standings, setStandings] = useState([]);
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStandings = async (leagueId) => {
    try {
      if (!refreshing) setLoading(true);

      const cacheKey = `standings_${leagueId}`;
      const cached = await getCache(cacheKey);
      if (cached && !refreshing) {
        setStandings(cached.table || []);
        setSeason(cached.season || null);
        setLoading(false);
      }

      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${leagueId}/standings`,
        { headers: { "X-Auth-Token": API_KEY } },
      );
      if (!res.ok) throw new Error("Unable to load league standings");

      const data = await res.json();
      const table = data.standings?.[0]?.table ?? [];
      const seasonInfo = data.season || null;

      setStandings(table);
      setSeason(seasonInfo);
      await setCache(cacheKey, { table, season: seasonInfo });
    } catch (error) {
      console.log("Error loading standings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStandings(selectedLeague);
  }, [selectedLeague]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStandings(selectedLeague);
  };

  // Determine qualification badge color
  const getPositionIndicator = (position, totalTeams) => {
    if (position <= 4) return THEME.colors.ucl; // Champions League
    if (position === 5) return THEME.colors.uel; // Europa League
    if (position > totalTeams - 3) return THEME.colors.relegation; // Relegation
    return "transparent";
  };

  // Parse or mock form badges (W, D, L)
  const getFormBadges = (formStr) => {
    if (!formStr) return ["W", "D", "W", "L", "W"];
    return formStr
      .split(",")
      .map((s) => s.trim())
      .slice(-5);
  };

  // RENDER: Standings Table
  const renderTable = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading league table...</Text>
        </View>
      );
    }

    if (standings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyTitle}>Table Unavailable</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const totalTeams = standings.length;

    return (
      <View style={styles.tableCard}>
        {/* Table Column Headers */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.thPos}>#</Text>
          <Text style={styles.thClub}>CLUB</Text>
          <Text style={styles.thStat}>MP</Text>
          <Text style={styles.thStat}>W</Text>
          <Text style={styles.thStat}>D</Text>
          <Text style={styles.thStat}>L</Text>
          <Text style={styles.thStat}>GD</Text>
          <Text style={styles.thPts}>PTS</Text>
        </View>

        {/* Table Rows */}
        {standings.map((team, idx) => {
          const indicatorColor = getPositionIndicator(team.position, totalTeams);
          const form = getFormBadges(team.form);

          return (
            <TouchableOpacity
              key={team.team.id || idx}
              activeOpacity={0.7}
              style={[
                styles.tableRow,
                idx % 2 === 1 && styles.tableRowAlt,
              ]}
              onPress={() => navigation.navigate("TeamDetails", { team: team.team })}
            >
              {/* Position with left colored strip */}
              <View style={styles.posCell}>
                <View style={[styles.posIndicatorBar, { backgroundColor: indicatorColor }]} />
                <Text style={styles.posText}>{team.position}</Text>
              </View>

              {/* Club Crest & Name */}
              <View style={styles.clubCell}>
                <Image
                  source={{ uri: team.team.crest }}
                  style={styles.clubLogo}
                  resizeMode="contain"
                />
                <View style={styles.clubNameBox}>
                  <Text style={styles.clubName} numberOfLines={1}>
                    {team.team.shortName || team.team.name}
                  </Text>
                  {/* Form mini dots */}
                  <View style={styles.formRow}>
                    {form.map((f, fi) => (
                      <View
                        key={fi}
                        style={[
                          styles.formDot,
                          f === "W" && styles.formDotWin,
                          f === "D" && styles.formDotDraw,
                          f === "L" && styles.formDotLoss,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Stats */}
              <Text style={styles.statText}>{team.playedGames}</Text>
              <Text style={styles.statText}>{team.won}</Text>
              <Text style={styles.statText}>{team.draw}</Text>
              <Text style={styles.statText}>{team.lost}</Text>
              <Text
                style={[
                  styles.statText,
                  team.goalDifference > 0 && styles.statGdPositive,
                  team.goalDifference < 0 && styles.statGdNegative,
                ]}
              >
                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
              </Text>
              <Text style={styles.ptsText}>{team.points}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Qualification Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: THEME.colors.ucl }]} />
            <Text style={styles.legendLabel}>Champions League (1-4)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: THEME.colors.uel }]} />
            <Text style={styles.legendLabel}>Europa League (5)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: THEME.colors.relegation }]} />
            <Text style={styles.legendLabel}>Relegation Zone</Text>
          </View>
        </View>
      </View>
    );
  };

  // RENDER: Top Scorers Leaderboard
  const renderTopScorers = () => {
    const scorers = TOP_SCORERS[selectedLeague] || TOP_SCORERS.PL;

    return (
      <View style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeaderRow}>
          <Text style={styles.lbHeaderTitle}>⚽ GOLDEN BOOT RACE</Text>
          <Text style={styles.lbHeaderSub}>Goals (Penalties)</Text>
        </View>

        {scorers.map((player) => (
          <View key={player.rank} style={styles.playerRankRow}>
            {/* Rank badge */}
            <View
              style={[
                styles.rankBadge,
                player.rank === 1 && styles.rankBadgeGold,
                player.rank === 2 && styles.rankBadgeSilver,
                player.rank === 3 && styles.rankBadgeBronze,
              ]}
            >
              <Text
                style={[
                  styles.rankBadgeText,
                  player.rank <= 3 && styles.rankBadgeTextTop,
                ]}
              >
                {player.rank}
              </Text>
            </View>

            {/* Player details */}
            <View style={styles.playerInfoCol}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerClub}>{player.team} • {player.matches} Matches</Text>
            </View>

            {/* Goals Pill */}
            <View style={styles.scorePill}>
              <Text style={styles.scoreMain}>{player.goals}</Text>
              {player.penalties > 0 && (
                <Text style={styles.scoreSub}>({player.penalties}p)</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // RENDER: Top Assists Leaderboard
  const renderTopAssists = () => {
    const assists = TOP_ASSISTS[selectedLeague] || TOP_ASSISTS.PL;

    return (
      <View style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeaderRow}>
          <Text style={styles.lbHeaderTitle}>🎯 TOP PLAYMAKERS</Text>
          <Text style={styles.lbHeaderSub}>Total Assists</Text>
        </View>

        {assists.map((player) => (
          <View key={player.rank} style={styles.playerRankRow}>
            {/* Rank badge */}
            <View
              style={[
                styles.rankBadge,
                player.rank === 1 && styles.rankBadgeGold,
                player.rank === 2 && styles.rankBadgeSilver,
                player.rank === 3 && styles.rankBadgeBronze,
              ]}
            >
              <Text
                style={[
                  styles.rankBadgeText,
                  player.rank <= 3 && styles.rankBadgeTextTop,
                ]}
              >
                {player.rank}
              </Text>
            </View>

            {/* Player details */}
            <View style={styles.playerInfoCol}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerClub}>{player.team} • {player.matches} Matches</Text>
            </View>

            {/* Assists Pill */}
            <View style={[styles.scorePill, styles.scorePillBlue]}>
              <Text style={[styles.scoreMain, styles.scoreMainBlue]}>{player.assists}</Text>
              <Text style={styles.scoreSub}>AST</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Standings & Stats</Text>
            <Text style={styles.headerSeason}>
              {season?.startDate ? `${season.startDate.split("-")[0]}/${season.endDate.split("-")[0]} Season` : "Current Season"}
            </Text>
          </View>

          <TouchableOpacity style={styles.circleButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* League Selector Ribbon */}
        <View style={styles.leagueRibbon}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leagueRibbonContent}
          >
            {LEAGUES.map((league) => {
              const isSelected = selectedLeague === league.id;
              return (
                <TouchableOpacity
                  key={league.id}
                  style={[styles.leagueBtn, isSelected && styles.activeLeagueBtn]}
                  onPress={() => setSelectedLeague(league.id)}
                >
                  <Text style={styles.leagueFlag}>{league.flag}</Text>
                  <Text style={[styles.leagueBtnText, isSelected && styles.activeLeagueBtnText]}>
                    {league.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sub-Tabs: Table, Top Scorers, Top Assists */}
        <View style={styles.subTabsContainer}>
          {["Table", "Top Scorers", "Top Assists"].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.subTabBtn, isSelected && styles.activeSubTabBtn]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.subTabBtnText, isSelected && styles.activeSubTabBtnText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Content Area */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.colors.primary}
            />
          }
        >
          {activeTab === "Table" && renderTable()}
          {activeTab === "Top Scorers" && renderTopScorers()}
          {activeTab === "Top Assists" && renderTopAssists()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
  },
  headerSeason: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  leagueRibbon: {
    paddingVertical: 8,
  },
  leagueRibbonContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  leagueBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activeLeagueBtn: {
    backgroundColor: "rgba(215, 252, 90, 0.16)",
    borderColor: THEME.colors.primary,
  },
  leagueFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  leagueBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeLeagueBtnText: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  subTabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 10,
    padding: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 13,
  },
  activeSubTabBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  subTabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  activeSubTabBtnText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  mainScrollView: { flex: 1 },
  mainScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  // Table
  tableCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  thPos: {
    width: 28,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.45)",
    textAlign: "center",
  },
  thClub: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.45)",
    paddingLeft: 6,
  },
  thStat: {
    width: 28,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.45)",
    textAlign: "center",
  },
  thPts: {
    width: 34,
    fontSize: 11,
    fontWeight: "900",
    color: THEME.colors.primary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tableRowAlt: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  posCell: {
    width: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  posIndicatorBar: {
    position: "absolute",
    left: -12,
    top: -2,
    bottom: -2,
    width: 3.5,
    borderRadius: 2,
  },
  posText: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.8)",
  },
  clubCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 6,
  },
  clubLogo: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  clubNameBox: {
    flex: 1,
  },
  clubName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  formRow: {
    flexDirection: "row",
    gap: 3,
    marginTop: 2,
  },
  formDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  formDotWin: { backgroundColor: "#00e676" },
  formDotDraw: { backgroundColor: "#888" },
  formDotLoss: { backgroundColor: "#ff2a44" },
  statText: {
    width: 28,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  statGdPositive: {
    color: "#00e676",
  },
  statGdNegative: {
    color: "#ff2a44",
  },
  ptsText: {
    width: 34,
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.primary,
    textAlign: "center",
  },
  legendContainer: {
    marginTop: 14,
    paddingTop: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendBox: {
    width: 9,
    height: 9,
    borderRadius: 2.5,
  },
  legendLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },

  // Leaderboard Cards
  leaderboardCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  leaderboardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  lbHeaderTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: THEME.colors.primary,
    letterSpacing: 0.6,
  },
  lbHeaderSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "700",
  },
  playerRankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankBadgeGold: { backgroundColor: "#ffd700" },
  rankBadgeSilver: { backgroundColor: "#c0c0c0" },
  rankBadgeBronze: { backgroundColor: "#cd7f32" },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  rankBadgeTextTop: {
    color: "#080a0f",
  },
  playerInfoCol: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  playerClub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 2,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  scorePillBlue: {
    backgroundColor: "rgba(0, 176, 255, 0.15)",
  },
  scoreMain: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  scoreMainBlue: {
    color: THEME.colors.blueAccent,
  },
  scoreSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },

  centerLoading: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
  },
  retryBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 12,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080a0f",
  },
});
