import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { setCache, getCache } from "../utils/cache";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { THEME } from "../constants/theme";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const LEAGUE_TABS = [
  { id: "FAV", name: "My Clubs ⭐" },
  { id: "ALL", name: "All Clubs" },
  { id: "PL", name: "Premier League" },
  { id: "PD", name: "La Liga" },
  { id: "SA", name: "Serie A" },
  { id: "BL1", name: "Bundesliga" },
  { id: "FL1", name: "Ligue 1" },
];

export default function FavouriteTeamsScreen() {
  const navigation = useNavigation();
  const [allTeams, setAllTeams] = useState([]);
  const [favTeams, setFavTeams] = useState([]);
  const [activeTab, setActiveTab] = useState("FAV");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFavourite, setSavingFavourite] = useState(null);

  const fetchLeagueTeams = async () => {
    try {
      setLoading(true);
      const cachedTeams = await getCache("all_teams_v2");
      if (cachedTeams && cachedTeams.length > 0) {
        setAllTeams(cachedTeams);
        setLoading(false);
        return;
      }

      // Fetch leagues in parallel
      const leagues = ["PL", "PD", "SA", "BL1", "FL1"];
      const responses = await Promise.allSettled(
        leagues.map((league) =>
          fetch(`https://api.football-data.org/v4/competitions/${league}/teams`, {
            headers: {
              "X-Auth-Token": API_KEY,
              "Content-Type": "application/json",
            },
          }).then((r) => (r.ok ? r.json() : null)),
        ),
      );

      let collected = [];
      responses.forEach((res, i) => {
        if (res.status === "fulfilled" && res.value?.teams) {
          const leagueCode = leagues[i];
          const enriched = res.value.teams.map((t) => ({ ...t, leagueCode }));
          collected.push(...enriched);
        }
      });

      const unique = Array.from(new Map(collected.map((t) => [t.id, t])).values());
      setAllTeams(unique);
      if (unique.length > 0) {
        await setCache("all_teams_v2", unique);
      }
    } catch (err) {
      console.log("Error fetching league teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavourites = async () => {
    if (!auth.currentUser) return;
    try {
      const snapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
      const ids = snapshot.data()?.favouriteTeamIds || [];
      setFavTeams(ids);
      if (ids.length === 0) {
        setActiveTab("ALL"); // Default to All if no favorites yet
      }
    } catch (error) {
      console.log("Error loading favourite teams:", error);
    }
  };

  useEffect(() => {
    fetchLeagueTeams();
    loadFavourites();
  }, []);

  const toggleFavourite = async (teamId) => {
    if (!auth.currentUser || savingFavourite) return;
    const next = favTeams.includes(teamId)
      ? favTeams.filter((id) => id !== teamId)
      : [...favTeams, teamId];

    setSavingFavourite(teamId);
    setFavTeams(next);
    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { favouriteTeamIds: next },
        { merge: true },
      );
    } catch (error) {
      console.log("Error saving favourite team:", error);
      setFavTeams(favTeams); // Revert on error
    } finally {
      setSavingFavourite(null);
    }
  };

  // Filtered Teams based on activeTab, search
  const filteredTeams = useMemo(() => {
    let list = allTeams;

    if (activeTab === "FAV") {
      list = allTeams.filter((t) => favTeams.includes(t.id));
    } else if (activeTab !== "ALL") {
      list = allTeams.filter((t) => t.leagueCode === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t?.name?.toLowerCase().includes(q) ||
        t?.shortName?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allTeams, favTeams, activeTab, search]);

  const myFavoritesList = useMemo(() => {
    return allTeams.filter((t) => favTeams.includes(t.id));
  }, [allTeams, favTeams]);

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitle}>Club Hub</Text>
            <Text style={styles.topSub}>{favTeams.length} Clubs Followed</Text>
          </View>

          <TouchableOpacity style={styles.circleBtn} onPress={fetchLeagueTeams}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={17} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search European clubs..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick My Clubs Horizontal Avatar Strip (if user has favorites) */}
        {myFavoritesList.length > 0 && !search && (
          <View style={styles.favStripSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favStripScroll}>
              {myFavoritesList.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.favStripItem}
                  onPress={() => navigation.navigate("TeamDetails", { team: club })}
                >
                  <View style={styles.favStripCircle}>
                    <Image source={{ uri: club.crest }} style={styles.favStripLogo} resizeMode="contain" />
                  </View>
                  <Text style={styles.favStripName} numberOfLines={1}>
                    {club.shortName || club.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* League / Filter Tabs Ribbon */}
        <View style={styles.leagueTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.leagueTabsScroll}>
            {LEAGUE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              const count = tab.id === "FAV" ? favTeams.length : null;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.leagueTabBtn, isSelected && styles.activeLeagueTabBtn]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.leagueTabText, isSelected && styles.activeLeagueTabText]}>
                    {tab.name}
                    {count !== null ? ` (${count})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Area */}
        {loading && allTeams.length === 0 ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Syncing football clubs...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTeams.length > 0 ? (
              <View style={styles.clubsGrid}>
                {filteredTeams.map((club) => {
                  const isFav = favTeams.includes(club.id);

                  return (
                    <TouchableOpacity
                      key={club.id}
                      style={styles.clubCard}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate("TeamDetails", { team: club })}
                    >
                      {/* Top Action / Star */}
                      <TouchableOpacity
                        style={styles.favStarBtn}
                        onPress={() => toggleFavourite(club.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? "star" : "star-outline"}
                          size={18}
                          color={isFav ? THEME.colors.primary : "rgba(255,255,255,0.4)"}
                        />
                      </TouchableOpacity>

                      {/* Club Crest */}
                      <View style={styles.clubLogoContainer}>
                        <Image source={{ uri: club.crest }} style={styles.clubLogo} resizeMode="contain" />
                      </View>

                      {/* Club Name */}
                      <Text style={styles.clubCardName} numberOfLines={1}>
                        {club.shortName || club.name}
                      </Text>

                      {/* Country or Founded */}
                      <Text style={styles.clubCountryText} numberOfLines={1}>
                        {club.venue ? club.venue : "Club"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="shield-star-outline" size={54} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>
                  {activeTab === "FAV" ? "No Favourite Clubs Added" : "No Clubs Found"}
                </Text>
                <Text style={styles.emptySub}>
                  {activeTab === "FAV"
                    ? "Tap the star icon on any club to follow them and get priority scores."
                    : "Try searching with another name or switch leagues."}
                </Text>

                {activeTab === "FAV" && (
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => setActiveTab("ALL")}
                  >
                    <Text style={styles.exploreBtnText}>Explore All Clubs</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        )}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitleBox: {
    alignItems: "center",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  topSub: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: "700",
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 2,
  },

  // Fav Strip
  favStripSection: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 8,
  },
  favStripScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  favStripItem: {
    alignItems: "center",
    width: 60,
  },
  favStripCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  favStripLogo: {
    width: "100%",
    height: "100%",
  },
  favStripName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },

  // League Tabs
  leagueTabsContainer: {
    paddingVertical: 4,
    marginBottom: 10,
  },
  leagueTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  leagueTabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  activeLeagueTabBtn: {
    backgroundColor: THEME.colors.primary,
  },
  leagueTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.65)",
  },
  activeLeagueTabText: {
    color: "#080a0f",
    fontWeight: "900",
  },

  mainScrollView: { flex: 1 },
  mainScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  clubsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  clubCard: {
    width: "48%",
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
  },
  favStarBtn: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  clubLogoContainer: {
    width: 60,
    height: 60,
    marginTop: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clubLogo: {
    width: "100%",
    height: "100%",
  },
  clubCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  clubCountryText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 3,
    textAlign: "center",
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
  exploreBtn: {
    marginTop: 18,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080a0f",
  },
});
