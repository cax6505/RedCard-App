import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { getRichMatchDetails } from "../utils/footballData";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MatchDetailsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const match = params?.match;

  const [activeTab, setActiveTab] = useState("Timeline"); // Timeline, Lineups, Stats, H2H, Commentary
  const [lineupTeam, setLineupTeam] = useState("home"); // home or away for lineup view
  const [details, setDetails] = useState(null);
  const [isPinned, setIsPinned] = useState(false);

  // Pulse animation for live match badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (match) {
      const rich = getRichMatchDetails(match);
      setDetails(rich);
    }
  }, [match]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Follow ${match?.home} vs ${match?.away} on RedCard Football App! Score: ${match?.score || "Upcoming"}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (!match) {
    return (
      <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
        <SafeAreaView style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Match Details Unavailable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isLive = match.status === "Live" || match.status === "IN_PLAY";
  const isScheduled = match.status === "Upcoming" || Boolean(match.time && !match.score);

  // RENDER: Timeline Tab
  const renderTimeline = () => {
    const events = details?.events || [];

    if (isScheduled && events.length === 0) {
      return (
        <View style={styles.tabEmptyBox}>
          <Ionicons name="time-outline" size={42} color="rgba(255,255,255,0.3)" />
          <Text style={styles.tabEmptyTitle}>Match Has Not Kicked Off</Text>
          <Text style={styles.tabEmptySub}>
            Live events, goals, cards, and substitutions will stream here in real-time.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        {events.map((ev, idx) => {
          const isHome = ev.team === "home";
          const isGoal = ev.type === "goal";
          const isYellow = ev.type === "yellow_card";
          const isRed = ev.type === "red_card";
          const isSub = ev.type === "sub";

          return (
            <View key={idx} style={[styles.timelineRow, isHome ? styles.timelineRowHome : styles.timelineRowAway]}>
              {/* Left / Home Event */}
              <View style={[styles.eventContent, !isHome && styles.eventContentHidden]}>
                {isHome && (
                  <View style={styles.eventBubble}>
                    <Text style={styles.eventPlayer}>{isSub ? `${ev.playerIn} (IN)` : ev.player}</Text>
                    {isSub && <Text style={styles.eventSubOut}>{ev.playerOut} (OUT)</Text>}
                    <Text style={styles.eventDetail}>{ev.detail}</Text>
                  </View>
                )}
              </View>

              {/* Center Minute Spine */}
              <View style={styles.timelineSpine}>
                <View style={styles.spineLine} />
                <View
                  style={[
                    styles.spineNode,
                    isGoal && styles.spineNodeGoal,
                    isRed && styles.spineNodeRed,
                    isYellow && styles.spineNodeYellow,
                  ]}
                >
                  {isGoal ? (
                    <Text style={styles.eventIcon}>⚽</Text>
                  ) : isRed ? (
                    <View style={styles.miniRedCard} />
                  ) : isYellow ? (
                    <View style={styles.miniYellowCard} />
                  ) : isSub ? (
                    <MaterialCommunityIcons name="swap-horizontal" size={14} color="#00e676" />
                  ) : (
                    <Text style={styles.spineMinuteText}>{ev.minute}'</Text>
                  )}
                </View>
                <Text style={styles.spineTimeLabel}>{ev.minute}'</Text>
              </View>

              {/* Right / Away Event */}
              <View style={[styles.eventContent, isHome && styles.eventContentHidden]}>
                {!isHome && (
                  <View style={[styles.eventBubble, styles.eventBubbleAway]}>
                    <Text style={styles.eventPlayer}>{isSub ? `${ev.playerIn} (IN)` : ev.player}</Text>
                    {isSub && <Text style={styles.eventSubOut}>{ev.playerOut} (OUT)</Text>}
                    <Text style={styles.eventDetail}>{ev.detail}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Milestone full-time chip */}
        <View style={styles.milestoneRow}>
          <View style={styles.milestonePill}>
            <Text style={styles.milestoneText}>
              {match.status === "Full-Time" ? "FULL-TIME" : isLive ? "LIVE IN PROGRESS" : "KICK-OFF"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // RENDER: Lineups & Tactical Pitch
  const renderLineups = () => {
    const lineupData = lineupTeam === "home" ? details?.homeLineup : details?.awayLineup;
    const teamName = lineupTeam === "home" ? match.home : match.away;
    const teamLogo = lineupTeam === "home" ? match.homeLogo : match.awayLogo;

    return (
      <View style={styles.lineupsContainer}>
        {/* Home / Away Lineup Switcher */}
        <View style={styles.lineupToggleContainer}>
          <TouchableOpacity
            style={[styles.lineupToggleBtn, lineupTeam === "home" && styles.activeLineupToggleBtn]}
            onPress={() => setLineupTeam("home")}
          >
            <Image source={match.homeLogo} style={styles.toggleLogo} />
            <Text style={[styles.lineupToggleText, lineupTeam === "home" && styles.activeLineupToggleText]} numberOfLines={1}>
              {match.home}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.lineupToggleBtn, lineupTeam === "away" && styles.activeLineupToggleBtn]}
            onPress={() => setLineupTeam("away")}
          >
            <Image source={match.awayLogo} style={styles.toggleLogo} />
            <Text style={[styles.lineupToggleText, lineupTeam === "away" && styles.activeLineupToggleText]} numberOfLines={1}>
              {match.away}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formation & Manager Header */}
        <View style={styles.formationBar}>
          <View>
            <Text style={styles.formationTitle}>{lineupData?.formation} Formation</Text>
            <Text style={styles.managerText}>Manager: {lineupData?.manager}</Text>
          </View>
          <View style={styles.tacticalBadge}>
            <Text style={styles.tacticalBadgeText}>STARTING XI</Text>
          </View>
        </View>

        {/* Tactical Pitch Graphic */}
        <View style={styles.pitch}>
          {/* Pitch Markings */}
          <View style={styles.pitchHalfway} />
          <View style={styles.pitchCenterCircle} />
          <View style={styles.pitchCenterDot} />
          <View style={styles.pitchPenaltyTop} />
          <View style={styles.pitchGoalTop} />
          <View style={styles.pitchPenaltyBottom} />
          <View style={styles.pitchGoalBottom} />

          {/* Starting XI Player Pins */}
          {lineupData?.startingXI.map((player, idx) => (
            <View
              key={idx}
              style={[
                styles.playerPin,
                { top: player.grid.top, left: player.grid.left },
              ]}
            >
              <View style={[styles.jerseyCircle, lineupTeam === "away" && styles.jerseyAway]}>
                <Text style={styles.jerseyNumber}>{player.num}</Text>
              </View>
              <View style={styles.playerNamePill}>
                <Text style={styles.playerPinName} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
              <Text style={styles.playerPinPos}>{player.pos}</Text>
            </View>
          ))}
        </View>

        {/* Substitutes Bench */}
        <View style={styles.benchCard}>
          <Text style={styles.benchTitle}>Substitutes Bench</Text>
          <View style={styles.benchList}>
            {lineupData?.subs.map((sub, idx) => (
              <View key={idx} style={styles.subItem}>
                <View style={styles.subDot} />
                <Text style={styles.subName}>{sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // RENDER: Stats Tab
  const renderStats = () => {
    const statsList = details?.stats || [];

    return (
      <View style={styles.statsContainer}>
        {/* Teams Legend Header */}
        <View style={styles.statsLegend}>
          <View style={styles.legendTeam}>
            <Image source={match.homeLogo} style={styles.legendLogo} />
            <Text style={styles.legendTeamName} numberOfLines={1}>{match.home}</Text>
          </View>
          <Text style={styles.legendVs}>COMPARISON</Text>
          <View style={styles.legendTeam}>
            <Image source={match.awayLogo} style={styles.legendLogo} />
            <Text style={styles.legendTeamName} numberOfLines={1}>{match.away}</Text>
          </View>
        </View>

        {/* Stat Bars */}
        {statsList.map((st, idx) => {
          const total = (st.homeVal || 50) + (st.awayVal || 50) || 100;
          const homePct = Math.round(((st.homeVal || 50) / total) * 100);
          const awayPct = 100 - homePct;

          return (
            <View key={idx} style={styles.statRow}>
              <View style={styles.statValuesRow}>
                <Text style={styles.statValHome}>{st.home}</Text>
                <Text style={styles.statLabel}>{st.label}</Text>
                <Text style={styles.statValAway}>{st.away}</Text>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFillHome, { width: `${homePct}%` }]} />
                <View style={[styles.barFillAway, { width: `${awayPct}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // RENDER: Head-to-Head (H2H) Tab
  const renderH2H = () => {
    const h2h = details?.h2h;

    return (
      <View style={styles.h2hContainer}>
        {/* H2H Win Ratio Box */}
        <View style={styles.h2hSummaryBox}>
          <Text style={styles.h2hSummaryTitle}>Past Meetings Record</Text>
          <View style={styles.h2hRatioRow}>
            <View style={styles.h2hRatioItem}>
              <Text style={styles.h2hRatioNum}>{h2h?.homeWins || 0}</Text>
              <Text style={styles.h2hRatioLabel}>{match.home} Wins</Text>
            </View>
            <View style={styles.h2hRatioItem}>
              <Text style={styles.h2hRatioNum}>{h2h?.draws || 0}</Text>
              <Text style={styles.h2hRatioLabel}>Draws</Text>
            </View>
            <View style={styles.h2hRatioItem}>
              <Text style={styles.h2hRatioNum}>{h2h?.awayWins || 0}</Text>
              <Text style={styles.h2hRatioLabel}>{match.away} Wins</Text>
            </View>
          </View>
        </View>

        {/* Recent Form Badges */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Recent Form Guide (Last 5 Matches)</Text>

          {/* Home Form */}
          <View style={styles.formRow}>
            <View style={styles.formTeamLeft}>
              <Image source={match.homeLogo} style={styles.formLogo} />
              <Text style={styles.formTeamName} numberOfLines={1}>{match.home}</Text>
            </View>
            <View style={styles.formBadges}>
              {h2h?.homeForm?.map((f, i) => (
                <View
                  key={i}
                  style={[
                    styles.formBadge,
                    f === "W" && styles.formWin,
                    f === "D" && styles.formDraw,
                    f === "L" && styles.formLoss,
                  ]}
                >
                  <Text style={styles.formBadgeText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Away Form */}
          <View style={styles.formRow}>
            <View style={styles.formTeamLeft}>
              <Image source={match.awayLogo} style={styles.formLogo} />
              <Text style={styles.formTeamName} numberOfLines={1}>{match.away}</Text>
            </View>
            <View style={styles.formBadges}>
              {h2h?.awayForm?.map((f, i) => (
                <View
                  key={i}
                  style={[
                    styles.formBadge,
                    f === "W" && styles.formWin,
                    f === "D" && styles.formDraw,
                    f === "L" && styles.formLoss,
                  ]}
                >
                  <Text style={styles.formBadgeText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Previous Meetings List */}
        <View style={styles.recentMeetingsBox}>
          <Text style={styles.recentMeetingsTitle}>Recent Head-to-Head Encounters</Text>
          {h2h?.recentMeetings?.map((m, idx) => (
            <View key={idx} style={styles.meetingItem}>
              <Text style={styles.meetingDate}>{m.date}</Text>
              <Text style={styles.meetingScore}>{m.score}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // RENDER: Commentary Tab
  const renderCommentary = () => {
    const commentary = details?.commentary || [];

    return (
      <View style={styles.commentaryContainer}>
        {commentary.map((c, idx) => (
          <View key={idx} style={styles.commentaryCard}>
            <View style={styles.commentaryHeader}>
              <View style={styles.commentaryMinuteBadge}>
                <Text style={styles.commentaryMinuteText}>{c.minute}</Text>
              </View>
              <Text style={styles.commentaryTitle}>{c.title}</Text>
            </View>
            <Text style={styles.commentaryBody}>{c.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Action Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerCompetition} numberOfLines={1}>
              {match.competition || "Match Centre"}
            </Text>
            <Text style={styles.headerSub}>Matchday {match.matchday || "28"}</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setIsPinned(!isPinned)}
            >
              <Ionicons
                name={isPinned ? "star" : "star-outline"}
                size={20}
                color={isPinned ? THEME.colors.primary : "#fff"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Arena Match Header Card */}
          <LinearGradient
            colors={
              isLive
                ? ["#350d18", "#1c1422", "#0f141f"]
                : ["#162132", "#101624", "#0a0e17"]
            }
            style={styles.arenaCard}
          >
            {/* Status Chip */}
            <View style={styles.arenaStatusRow}>
              {isLive ? (
                <View style={styles.liveArenaBadge}>
                  <Animated.View style={[styles.pulseRedDot, { opacity: pulseAnim }]} />
                  <Text style={styles.liveArenaText}>LIVE 74' • IN PLAY</Text>
                </View>
              ) : isScheduled ? (
                <View style={styles.scheduledBadge}>
                  <Text style={styles.scheduledText}>KICK-OFF TODAY</Text>
                </View>
              ) : (
                <View style={styles.finishedBadge}>
                  <Text style={styles.finishedText}>FULL TIME</Text>
                </View>
              )}
            </View>

            {/* Teams Faceoff */}
            <View style={styles.arenaTeamsRow}>
              {/* Home */}
              <View style={styles.arenaTeamCol}>
                <Image source={match.homeLogo} style={styles.arenaLogo} resizeMode="contain" />
                <Text style={styles.arenaTeamName}>{match.home}</Text>
              </View>

              {/* Center Score / Time */}
              <View style={styles.arenaCenterCol}>
                {match.score ? (
                  <>
                    <Text style={styles.arenaScore}>{match.score}</Text>
                    <Text style={styles.arenaHalftime}>HT: 1 - 0</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.arenaTime}>{match.time || "20:00"}</Text>
                    <Text style={styles.arenaDate}>{match.date}</Text>
                  </>
                )}
              </View>

              {/* Away */}
              <View style={styles.arenaTeamCol}>
                <Image source={match.awayLogo} style={styles.arenaLogo} resizeMode="contain" />
                <Text style={styles.arenaTeamName}>{match.away}</Text>
              </View>
            </View>

            {/* Match Venue & Referee Info */}
            <View style={styles.arenaFooterRow}>
              <View style={styles.arenaInfoItem}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.arenaInfoText}>{details?.venue || "Metropolitan Stadium"}</Text>
              </View>
              <View style={styles.arenaInfoItem}>
                <Ionicons name="shirt-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.arenaInfoText}>{details?.referee || "Michael Oliver"}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Interactive Navigation Tabs */}
          <View style={styles.tabsRibbon}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {["Timeline", "Lineups", "Stats", "H2H", "Commentary"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, isActive && styles.activeTabButton]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Active Tab Screen Content */}
          <View style={styles.tabContentContainer}>
            {activeTab === "Timeline" && renderTimeline()}
            {activeTab === "Lineups" && renderLineups()}
            {activeTab === "Stats" && renderStats()}
            {activeTab === "H2H" && renderH2H()}
            {activeTab === "Commentary" && renderCommentary()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerCompetition: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mainScrollView: { flex: 1 },
  mainScrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Arena Card
  arenaCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  arenaStatusRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  liveArenaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 42, 68, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.4)",
  },
  pulseRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.redCard,
    marginRight: 6,
  },
  liveArenaText: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.redCard,
    letterSpacing: 0.5,
  },
  scheduledBadge: {
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  scheduledText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  finishedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  finishedText: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
  },
  arenaTeamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arenaTeamCol: {
    flex: 1,
    alignItems: "center",
  },
  arenaLogo: {
    width: 64,
    height: 64,
  },
  arenaTeamName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  arenaCenterCol: {
    alignItems: "center",
    minWidth: 110,
  },
  arenaScore: {
    fontSize: 40,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 2,
  },
  arenaHalftime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
    fontWeight: "600",
  },
  arenaTime: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  arenaDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 3,
  },
  arenaFooterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  arenaInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  arenaInfoText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },

  // Tabs Ribbon
  tabsRibbon: {
    marginTop: 18,
    marginBottom: 10,
  },
  tabsScroll: {
    gap: 8,
  },
  tabButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  activeTabButton: {
    backgroundColor: THEME.colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.65)",
  },
  activeTabButtonText: {
    color: "#080a0f",
    fontWeight: "900",
  },
  tabContentContainer: {
    marginTop: 8,
  },

  // Timeline
  timelineContainer: {
    paddingVertical: 10,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timelineRowHome: {},
  timelineRowAway: {},
  eventContent: {
    flex: 1,
  },
  eventContentHidden: {
    opacity: 0,
  },
  eventBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  eventBubbleAway: {
    alignItems: "flex-end",
  },
  eventPlayer: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  eventSubOut: {
    fontSize: 11,
    color: "#ff2a44",
    marginTop: 2,
    fontWeight: "600",
  },
  eventDetail: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 3,
  },
  timelineSpine: {
    width: 50,
    alignItems: "center",
    position: "relative",
  },
  spineLine: {
    position: "absolute",
    top: -20,
    bottom: -20,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  spineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1b2333",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  spineNodeGoal: {
    backgroundColor: "#0d2b17",
    borderColor: "#00e676",
  },
  spineNodeRed: {
    backgroundColor: "#3a0e14",
    borderColor: THEME.colors.redCard,
  },
  spineNodeYellow: {
    backgroundColor: "#332a08",
    borderColor: THEME.colors.yellowCard,
  },
  miniRedCard: {
    width: 9,
    height: 13,
    backgroundColor: THEME.colors.redCard,
    borderRadius: 2,
  },
  miniYellowCard: {
    width: 9,
    height: 13,
    backgroundColor: THEME.colors.yellowCard,
    borderRadius: 2,
  },
  eventIcon: {
    fontSize: 13,
  },
  spineMinuteText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  spineTimeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.45)",
    marginTop: 2,
  },
  milestoneRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  milestonePill: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.8,
  },

  // Lineups & Pitch
  lineupsContainer: {
    paddingVertical: 6,
  },
  lineupToggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 3,
    marginBottom: 12,
  },
  lineupToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 13,
    gap: 8,
  },
  activeLineupToggleBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  toggleLogo: {
    width: 20,
    height: 20,
  },
  lineupToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  activeLineupToggleText: {
    color: "#fff",
    fontWeight: "900",
  },
  formationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  formationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  managerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 2,
  },
  tacticalBadge: {
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tacticalBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.colors.primary,
  },

  // Pitch Graphic
  pitch: {
    height: 440,
    backgroundColor: "#163d20",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    position: "relative",
    overflow: "hidden",
  },
  pitchHalfway: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  pitchCenterCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -40,
    marginLeft: -40,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  pitchCenterDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -3,
    marginLeft: -3,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  pitchPenaltyTop: {
    position: "absolute",
    top: 0,
    left: "25%",
    right: "25%",
    height: 60,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  pitchGoalTop: {
    position: "absolute",
    top: 0,
    left: "37%",
    right: "37%",
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  pitchPenaltyBottom: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 60,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  pitchGoalBottom: {
    position: "absolute",
    bottom: 0,
    left: "37%",
    right: "37%",
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  playerPin: {
    position: "absolute",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    alignItems: "center",
    width: 48,
  },
  jerseyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d7fc5a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#080a0f",
  },
  jerseyAway: {
    backgroundColor: "#00b0ff",
  },
  jerseyNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: "#080a0f",
  },
  playerNamePill: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  playerPinName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  playerPinPos: {
    fontSize: 8,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.75)",
  },
  benchCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  benchTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  benchList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    marginRight: 6,
  },
  subName: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },

  // Stats
  statsContainer: {
    paddingVertical: 6,
  },
  statsLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  legendTeam: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 120,
  },
  legendLogo: {
    width: 22,
    height: 22,
  },
  legendTeamName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  legendVs: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.4)",
  },
  statRow: {
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 12,
    borderRadius: 14,
  },
  statValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValHome: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.primary,
    minWidth: 40,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
  },
  statValAway: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.blueAccent,
    minWidth: 40,
    textAlign: "right",
  },
  barTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
  },
  barFillHome: {
    height: "100%",
    backgroundColor: THEME.colors.primary,
  },
  barFillAway: {
    height: "100%",
    backgroundColor: THEME.colors.blueAccent,
  },

  // H2H
  h2hContainer: {
    paddingVertical: 6,
  },
  h2hSummaryBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  h2hSummaryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 12,
  },
  h2hRatioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  h2hRatioItem: {
    alignItems: "center",
  },
  h2hRatioNum: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
  },
  h2hRatioLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    fontWeight: "600",
  },
  formSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  formTeamLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  formLogo: {
    width: 24,
    height: 24,
  },
  formTeamName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  formBadges: {
    flexDirection: "row",
    gap: 5,
  },
  formBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  formWin: { backgroundColor: "#00e676" },
  formDraw: { backgroundColor: "#757575" },
  formLoss: { backgroundColor: "#ff2a44" },
  formBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#fff",
  },
  recentMeetingsBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  recentMeetingsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 10,
  },
  meetingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  meetingDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  meetingScore: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },

  // Commentary
  commentaryContainer: {
    paddingVertical: 6,
  },
  commentaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  commentaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  commentaryMinuteBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  commentaryMinuteText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#080a0f",
  },
  commentaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  commentaryBody: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.75)",
    lineHeight: 18,
  },

  // Empty state
  tabEmptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  tabEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
  },
  tabEmptySub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#080a0f",
  },
});
