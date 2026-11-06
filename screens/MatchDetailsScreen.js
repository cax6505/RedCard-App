import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { getRichMatchDetails } from "../utils/footballData";
import { SafeCrest, SafePlayerFace } from "../components/SafeImage";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MatchDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const match = route.params?.match || {};

  const [activeTab, setActiveTab] = useState("Timeline"); // Timeline, Lineups, Stats, H2H, Commentary
  const [lineupTeam, setLineupTeam] = useState("home"); // home or away
  const [isPinned, setIsPinned] = useState(false);

  // Synchronously compute details to guarantee NO null pointer render crashes
  const details = useMemo(() => {
    try {
      return getRichMatchDetails(match);
    } catch (e) {
      console.log("Error computing match details:", e);
      return null;
    }
  }, [match]);

  // Pulse animation for live badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Match Update: ${match.home || "Home"} vs ${match.away || "Away"}\nScore: ${
          match.score || match.time || "Upcoming"
        }\nVenue: ${details?.venue || "Stadium"}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (!match || !match.home) {
    return (
      <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
        <SafeAreaView style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={THEME.colors.primary} />
          <Text style={styles.emptyTitle}>Match Details Unavailable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Return to Matches</Text>
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
            Live events, goals, disciplinary cards, and substitutions will stream here in real-time.
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
            <View
              key={idx}
              style={[
                styles.timelineRow,
                isHome ? styles.timelineRowHome : styles.timelineRowAway,
              ]}
            >
              {/* Left / Home Event */}
              <View style={[styles.eventContent, !isHome && styles.eventContentHidden]}>
                {isHome && (
                  <View style={styles.eventBubble}>
                    <View style={styles.eventPlayerRow}>
                      <SafePlayerFace
                        uri={ev.photo}
                        name={ev.player}
                        size={28}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventPlayer} numberOfLines={1}>
                          {isSub ? `${ev.playerIn} (IN)` : ev.player}
                        </Text>
                        {isSub && <Text style={styles.eventSubOut}>{ev.playerOut} (OUT)</Text>}
                      </View>
                    </View>
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
                    <Ionicons name="football" size={13} color="#00e676" />
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
                    <View style={[styles.eventPlayerRow, { flexDirection: "row-reverse" }]}>
                      <SafePlayerFace
                        uri={ev.photo}
                        name={ev.player}
                        size={28}
                        style={{ marginLeft: 8 }}
                      />
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Text style={styles.eventPlayer} numberOfLines={1}>
                          {isSub ? `${ev.playerIn} (IN)` : ev.player}
                        </Text>
                        {isSub && <Text style={styles.eventSubOut}>{ev.playerOut} (OUT)</Text>}
                      </View>
                    </View>
                    <Text style={[styles.eventDetail, { textAlign: "right" }]}>{ev.detail}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Milestone chip */}
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

  // RENDER: Lineups & Tactical Pitch with Real Player Faces
  const renderLineups = () => {
    const lineupData = lineupTeam === "home" ? details?.homeLineup : details?.awayLineup;
    const teamName = lineupTeam === "home" ? match.home : match.away;
    const teamLogo = lineupTeam === "home" ? match.homeLogo : match.awayLogo;
    const startingXI = lineupData?.startingXI || [];
    const subs = lineupData?.subs || [];

    return (
      <View style={styles.lineupsContainer}>
        {/* Home / Away Lineup Switcher */}
        <View style={styles.lineupToggleContainer}>
          <TouchableOpacity
            style={[styles.lineupToggleBtn, lineupTeam === "home" && styles.activeLineupToggleBtn]}
            onPress={() => setLineupTeam("home")}
            activeOpacity={0.8}
          >
            <SafeCrest source={match.homeLogo} name={match.home} size={22} />
            <Text
              style={[
                styles.lineupToggleText,
                lineupTeam === "home" && styles.activeLineupToggleText,
              ]}
              numberOfLines={1}
            >
              {match.home}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.lineupToggleBtn, lineupTeam === "away" && styles.activeLineupToggleBtn]}
            onPress={() => setLineupTeam("away")}
            activeOpacity={0.8}
          >
            <SafeCrest source={match.awayLogo} name={match.away} size={22} />
            <Text
              style={[
                styles.lineupToggleText,
                lineupTeam === "away" && styles.activeLineupToggleText,
              ]}
              numberOfLines={1}
            >
              {match.away}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formation & Manager Header */}
        <View style={styles.formationBar}>
          <View>
            <Text style={styles.formationTitle}>{lineupData?.formation || "4-3-3"} Formation</Text>
            <Text style={styles.managerText}>Manager: {lineupData?.manager || "Head Coach"}</Text>
          </View>
          <View style={styles.tacticalBadge}>
            <Text style={styles.tacticalBadgeText}>STARTING XI</Text>
          </View>
        </View>

        {/* Tactical Pitch Graphic with REAL Player Faces */}
        <View style={styles.pitch}>
          {/* Pitch Markings */}
          <View style={styles.pitchHalfway} />
          <View style={styles.pitchCenterCircle} />
          <View style={styles.pitchCenterDot} />
          <View style={styles.pitchPenaltyTop} />
          <View style={styles.pitchGoalTop} />
          <View style={styles.pitchPenaltyBottom} />
          <View style={styles.pitchGoalBottom} />

          {/* Starting XI Player Pins with Faces */}
          {startingXI.map((player, idx) => (
            <View
              key={idx}
              style={[
                styles.playerPin,
                { top: player.grid?.top || "50%", left: player.grid?.left || "50%" },
              ]}
            >
              <View style={styles.playerAvatarWrapper}>
                <SafePlayerFace
                  uri={player.photo}
                  name={player.name}
                  number={player.num}
                  size={36}
                  borderColor={lineupTeam === "home" ? THEME.colors.primary : "#00b0ff"}
                />
                <View
                  style={[
                    styles.jerseyBadgeSmall,
                    lineupTeam === "away" && styles.jerseyBadgeAway,
                  ]}
                >
                  <Text style={styles.jerseyBadgeText}>{player.num}</Text>
                </View>
              </View>

              <View style={styles.playerNamePill}>
                <Text style={styles.playerPinName} numberOfLines={1}>
                  {player.name ? player.name.split(" ").pop() : player.pos}
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
            {subs.map((sub, idx) => (
              <View key={idx} style={styles.subItem}>
                <SafePlayerFace name={sub} size={22} style={{ marginRight: 6 }} />
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
            <SafeCrest source={match.homeLogo} name={match.home} size={24} style={{ marginRight: 6 }} />
            <Text style={styles.legendTeamName} numberOfLines={1}>{match.home}</Text>
          </View>
          <Text style={styles.legendVs}>COMPARISON</Text>
          <View style={styles.legendTeam}>
            <SafeCrest source={match.awayLogo} name={match.away} size={24} style={{ marginRight: 6 }} />
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
              <SafeCrest source={match.homeLogo} name={match.home} size={22} style={{ marginRight: 8 }} />
              <Text style={styles.formTeamName} numberOfLines={1}>{match.home}</Text>
            </View>
            <View style={styles.formBadges}>
              {(h2h?.homeForm || ["W", "D", "W"]).map((f, i) => (
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
              <SafeCrest source={match.awayLogo} name={match.away} size={22} style={{ marginRight: 8 }} />
              <Text style={styles.formTeamName} numberOfLines={1}>{match.away}</Text>
            </View>
            <View style={styles.formBadges}>
              {(h2h?.awayForm || ["D", "W", "L"]).map((f, i) => (
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
          {(h2h?.recentMeetings || []).map((m, idx) => (
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
                  <Text style={styles.liveArenaText}>LIVE {match.minute || "IN PLAY"}</Text>
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
              {/* Home Team */}
              <View style={styles.arenaTeamCol}>
                <SafeCrest source={match.homeLogo} name={match.home} size={58} />
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
                    <Text style={styles.arenaDate}>{match.date || "Today"}</Text>
                  </>
                )}
              </View>

              {/* Away Team */}
              <View style={styles.arenaTeamCol}>
                <SafeCrest source={match.awayLogo} name={match.away} size={58} />
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
                    activeOpacity={0.8}
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
  mainScrollContent: { paddingHorizontal: 16, paddingBottom: 60 },

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
    fontSize: 38,
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
  eventPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
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
    marginTop: 2,
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
    height: 460,
    backgroundColor: "#13381c",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    position: "relative",
    overflow: "hidden",
  },
  pitchHalfway: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  playerPin: {
    position: "absolute",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    alignItems: "center",
    width: 52,
  },
  playerAvatarWrapper: {
    position: "relative",
  },
  jerseyBadgeSmall: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: THEME.colors.primary,
    borderRadius: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#080a0f",
  },
  jerseyBadgeAway: {
    backgroundColor: "#00b0ff",
  },
  jerseyBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#080a0f",
  },
  playerNamePill: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 58,
  },
  playerPinName: {
    fontSize: 9,
    fontWeight: "800",
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
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
    maxWidth: 130,
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
    flex: 1,
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
    marginTop: 12,
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
