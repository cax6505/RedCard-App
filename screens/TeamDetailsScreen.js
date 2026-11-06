import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getCache, setCache } from "../utils/cache";
import { SafeCrest, SafePlayerFace } from "../components/SafeImage";
import { getPlayerFace } from "../utils/footballData";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export default function TeamDetailsScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const team = params?.team || {};

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Squad"); // Squad, Overview, Fixtures
  const [selectedPositionFilter, setSelectedPositionFilter] = useState("All"); // All, GK, DEF, MID, ATT
  const [isFavorite, setIsFavorite] = useState(false);

  // Player Details Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (team?.id) {
      fetchTeam();
      checkFavoriteStatus();
    }
  }, [team?.id]);

  const checkFavoriteStatus = async () => {
    if (!auth.currentUser || !team?.id) return;
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const favs = snap.data()?.favouriteTeamIds || [];
      setIsFavorite(favs.includes(team.id));
    } catch (err) {
      console.log("Error checking fav status:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!auth.currentUser || !team?.id) return;
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      let favs = snap.data()?.favouriteTeamIds || [];
      if (nextState) {
        if (!favs.includes(team.id)) favs.push(team.id);
      } else {
        favs = favs.filter((id) => id !== team.id);
      }
      await setDoc(doc(db, "users", auth.currentUser.uid), { favouriteTeamIds: favs }, { merge: true });
    } catch (err) {
      console.log("Error updating favorite:", err);
      setIsFavorite(!nextState);
    }
  };

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const cacheKey = `team_details_${team.id}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        setDetails(cached);
        setLoading(false);
      }

      const res = await fetch(`https://api.football-data.org/v4/teams/${team.id}`, {
        headers: { "X-Auth-Token": API_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
        await setCache(cacheKey, data);
      }
    } catch (err) {
      console.log("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerPhoto = async (playerName) => {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const player = data?.player?.[0];
      return player?.strCutout || player?.strThumb || player?.strFanart1 || null;
    } catch {
      return null;
    }
  };

  const handleSelectPlayer = async (p) => {
    setModalLoading(true);
    setModalVisible(true);
    try {
      const photo = await fetchPlayerPhoto(p.name);
      setSelectedPlayer({ ...p, photo });
    } finally {
      setModalLoading(false);
    }
  };

  // Group squad by positions
  const categorizedSquad = useMemo(() => {
    const squad = details?.squad || [];
    const groups = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: [],
    };

    squad.forEach((p) => {
      const pos = (p.position || "").toLowerCase();
      if (pos.includes("goalkeeper") || pos.includes("keeper")) {
        groups.goalkeepers.push(p);
      } else if (pos.includes("defence") || pos.includes("back") || pos.includes("defender")) {
        groups.defenders.push(p);
      } else if (pos.includes("midfield")) {
        groups.midfielders.push(p);
      } else {
        groups.forwards.push(p);
      }
    });

    return groups;
  }, [details?.squad]);

  // Filtered Squad
  const filteredSquadList = useMemo(() => {
    if (selectedPositionFilter === "GK") return categorizedSquad.goalkeepers;
    if (selectedPositionFilter === "DEF") return categorizedSquad.defenders;
    if (selectedPositionFilter === "MID") return categorizedSquad.midfielders;
    if (selectedPositionFilter === "ATT") return categorizedSquad.forwards;
    return details?.squad || [];
  }, [selectedPositionFilter, categorizedSquad, details?.squad]);

  // Mock club recent & upcoming fixtures
  const clubFixtures = useMemo(() => {
    const teamName = details?.shortName || team?.name || "Club";
    return [
      { opponent: "Real Madrid", isHome: true, date: "10 Feb", time: "20:00", comp: "Champions League", status: "Upcoming" },
      { opponent: "Arsenal", isHome: false, date: "03 Feb", score: "2 - 1", comp: "Premier League", status: "Finished" },
      { opponent: "Chelsea", isHome: true, date: "28 Jan", score: "3 - 1", comp: "Premier League", status: "Finished" },
      { opponent: "Liverpool", isHome: false, date: "21 Jan", score: "1 - 1", comp: "Premier League", status: "Finished" },
    ];
  }, [details, team]);

  if (loading && !details) {
    return (
      <LinearGradient colors={THEME.colors.gradientBackground} style={styles.centerLoading}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading club profile...</Text>
      </LinearGradient>
    );
  }

  const crestUri = details?.crest || team?.crest;

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.navTitle} numberOfLines={1}>
            {details?.shortName || team?.name || "Team"}
          </Text>

          <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={22}
              color={isFavorite ? THEME.colors.primary : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Club Hero Arena Banner */}
          <LinearGradient
            colors={["#1c2838", "#121926", "#0c1017"]}
            style={styles.heroCard}
          >
            <View style={styles.heroCrestBox}>
              <Image source={{ uri: crestUri }} style={styles.heroCrest} resizeMode="contain" />
            </View>

            <Text style={styles.heroFullName}>{details?.name || team?.name}</Text>

            {/* Badges Row */}
            <View style={styles.heroBadgesRow}>
              {details?.founded && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>Est. {details.founded}</Text>
                </View>
              )}
              {details?.venue && (
                <View style={styles.heroBadge}>
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" style={{ marginRight: 4 }} />
                  <Text style={styles.heroBadgeText} numberOfLines={1}>{details.venue}</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => navigation.navigate("LineupBuilder", { team: details || team })}
              >
                <Ionicons name="football" size={16} color="#080a0f" />
                <Text style={styles.heroPrimaryBtnText}>Build Squad Lineup</Text>
              </TouchableOpacity>

              {details?.website && (
                <TouchableOpacity
                  style={styles.heroSecondaryBtn}
                  onPress={() => Linking.openURL(details.website)}
                >
                  <Ionicons name="globe-outline" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Sub-Tabs: Squad, Overview, Fixtures */}
          <View style={styles.tabsRibbon}>
            {["Squad", "Overview", "Fixtures"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabBtnText, isActive && styles.activeTabBtnText]}>
                    {tab}
                    {tab === "Squad" && details?.squad?.length ? ` (${details.squad.length})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB: Squad */}
          {activeTab === "Squad" && (
            <View style={styles.squadTabContainer}>
              {/* Position Filter Pills */}
              <View style={styles.posFilterRow}>
                {["All", "GK", "DEF", "MID", "ATT"].map((pos) => {
                  const isSel = selectedPositionFilter === pos;
                  return (
                    <TouchableOpacity
                      key={pos}
                      style={[styles.posFilterPill, isSel && styles.activePosFilterPill]}
                      onPress={() => setSelectedPositionFilter(pos)}
                    >
                      <Text style={[styles.posFilterText, isSel && styles.activePosFilterText]}>
                        {pos}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Squad Players List */}
              <View style={styles.squadListCard}>
                {filteredSquadList.length > 0 ? (
                  filteredSquadList.map((p, idx) => (
                    <TouchableOpacity
                      key={p.id || idx}
                      style={styles.playerItemRow}
                      activeOpacity={0.75}
                      onPress={() => handleSelectPlayer(p)}
                    >
                      <SafePlayerFace
                        uri={getPlayerFace(p.name)}
                        name={p.name}
                        number={p.shirtNumber}
                        size={36}
                        style={{ marginRight: 12 }}
                      />

                      <View style={styles.playerInfoColumn}>
                        <Text style={styles.playerRowName}>{p.name}</Text>
                        <Text style={styles.playerRowPosition}>
                          {p.position || "Player"} • {p.nationality || "International"}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptySquadBox}>
                    <Text style={styles.emptySquadText}>Squad list currently unavailable</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB: Overview */}
          {activeTab === "Overview" && (
            <View style={styles.overviewContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Club Details</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Official Name</Text>
                  <Text style={styles.infoValue}>{details?.name || "—"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Home Stadium</Text>
                  <Text style={styles.infoValue}>{details?.venue || "—"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Club Colors</Text>
                  <Text style={styles.infoValue}>{details?.clubColors || "—"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{details?.address || "—"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Official Website</Text>
                  <Text
                    style={styles.infoLink}
                    onPress={() => details?.website && Linking.openURL(details.website)}
                  >
                    {details?.website || "—"}
                  </Text>
                </View>
              </View>

              {/* Running Competitions */}
              {details?.runningCompetitions?.length > 0 && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Active Competitions</Text>
                  <View style={styles.compList}>
                    {details.runningCompetitions.map((comp) => (
                      <View key={comp.id} style={styles.compPill}>
                        {comp.emblem ? (
                          <Image source={{ uri: comp.emblem }} style={styles.compEmblem} />
                        ) : null}
                        <Text style={styles.compName}>{comp.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* TAB: Fixtures */}
          {activeTab === "Fixtures" && (
            <View style={styles.fixturesContainer}>
              {clubFixtures.map((f, i) => (
                <View key={i} style={styles.fixtureCard}>
                  <View style={styles.fixtureHeader}>
                    <Text style={styles.fixtureComp}>{f.comp}</Text>
                    <Text style={styles.fixtureStatus}>{f.status}</Text>
                  </View>

                  <View style={styles.fixtureTeamsRow}>
                    <Text style={styles.fixtureTeamName}>
                      {f.isHome ? details?.shortName || team.name : f.opponent}
                    </Text>
                    <View style={styles.fixtureCenterBox}>
                      {f.score ? (
                        <Text style={styles.fixtureScore}>{f.score}</Text>
                      ) : (
                        <Text style={styles.fixtureTime}>{f.time}</Text>
                      )}
                      <Text style={styles.fixtureDate}>{f.date}</Text>
                    </View>
                    <Text style={styles.fixtureTeamName}>
                      {f.isHome ? f.opponent : details?.shortName || team.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Player Profile Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedPlayer(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setModalVisible(false);
                setSelectedPlayer(null);
              }}
            />

            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedPlayer(null);
                }}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>

              {modalLoading ? (
                <View style={styles.modalLoadingBox}>
                  <ActivityIndicator size="large" color={THEME.colors.primary} />
                  <Text style={styles.modalLoadingText}>Loading player profile...</Text>
                </View>
              ) : selectedPlayer ? (
                <View style={styles.modalBody}>
                  <View style={styles.playerAvatarContainer}>
                    <Image
                      source={{
                        uri:
                          selectedPlayer.photo ||
                          "https://cdn.sofifa.net/players/notfound_0_120.png",
                      }}
                      style={styles.playerModalPhoto}
                      resizeMode="cover"
                    />
                  </View>

                  <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                  <Text style={styles.modalPlayerRole}>
                    {selectedPlayer.position || "Squad Member"} • #{selectedPlayer.shirtNumber || "—"}
                  </Text>

                  <View style={styles.modalStatsCard}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Nationality</Text>
                      <Text style={styles.modalStatValue}>{selectedPlayer.nationality || "—"}</Text>
                    </View>

                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Date of Birth</Text>
                      <Text style={styles.modalStatValue}>{selectedPlayer.dateOfBirth || "—"}</Text>
                    </View>

                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Club</Text>
                      <Text style={styles.modalStatValue}>{details?.shortName || team.name}</Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    maxWidth: 200,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  heroCrestBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  heroCrest: {
    width: "100%",
    height: "100%",
  },
  heroFullName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 12,
    textAlign: "center",
  },
  heroBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.75)",
  },
  heroActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  heroPrimaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080a0f",
  },
  heroSecondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs Ribbon
  tabsRibbon: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 3,
    marginTop: 16,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 13,
  },
  activeTabBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  activeTabBtnText: {
    color: "#fff",
    fontWeight: "900",
  },

  // Squad Tab
  squadTabContainer: {},
  posFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  posFilterPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  activePosFilterPill: {
    backgroundColor: THEME.colors.primary,
  },
  posFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activePosFilterText: {
    color: "#080a0f",
    fontWeight: "900",
  },
  squadListCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  playerItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  playerNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerNumText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  playerInfoColumn: {
    flex: 1,
  },
  playerRowName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  playerRowPosition: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 2,
  },
  emptySquadBox: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptySquadText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
  },

  // Overview Tab
  overviewContainer: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  infoLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
    maxWidth: 200,
    textAlign: "right",
  },
  infoLink: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  compList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  compPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  compEmblem: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  compName: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },

  // Fixtures Tab
  fixturesContainer: {
    gap: 10,
  },
  fixtureCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  fixtureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  fixtureComp: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
  },
  fixtureStatus: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  fixtureTeamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fixtureTeamName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
  },
  fixtureCenterBox: {
    alignItems: "center",
    minWidth: 80,
  },
  fixtureScore: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  fixtureTime: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  fixtureDate: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },

  // Player Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: "#121722",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalLoadingBox: {
    paddingVertical: 50,
    alignItems: "center",
  },
  modalLoadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
  },
  modalBody: {
    alignItems: "center",
  },
  playerAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  playerModalPhoto: {
    width: "100%",
    height: "100%",
  },
  modalPlayerName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  modalPlayerRole: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: "700",
    marginTop: 4,
  },
  modalStatsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  modalStatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  modalStatLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: "600",
  },
  modalStatValue: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "800",
  },
});
