import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { setCache, getCache } from "../utils/cache";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function FavouriteTeamsScreen() {
  const navigation = useNavigation();
  const [allTeams, setAllTeams] = useState([]);
  const [favTeams, setFavTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFavourite, setSavingFavourite] = useState(null);

  const leagues = ["PD", "PL", "SA", "BL1", "FL1"];

  const fetchLeagueTeams = async () => {
    try {
      setLoading(true);
      const cachedTeams = await getCache("all_teams");
      if (cachedTeams) {
        setAllTeams(cachedTeams);
        setLoading(false);
        return;
      }
      let collected = [];
      for (const league of leagues) {
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${league}/teams`,
          {
            headers: {
              "X-Auth-Token": API_KEY,
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.teams) collected.push(...data.teams);
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      const unique = Array.from(
        new Map(collected.map((t) => [t.id, t])).values(),
      );
      setAllTeams(unique);
      await setCache("all_teams", unique);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueTeams();
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    if (!auth.currentUser) return;
    try {
      const snapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
      const ids = snapshot.data()?.favouriteTeamIds || [];
      setFavTeams(ids);
    } catch (error) {
      console.log("Error loading favourite teams:", error);
    }
  };

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
      setFavTeams(favTeams);
      console.log("Error saving favourite team:", error);
    } finally {
      setSavingFavourite(null);
    }
  };

  const filteredTeams = search
    ? allTeams.filter((t) =>
        t?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : favTeams.length > 0
      ? allTeams.filter((team) => favTeams.includes(team.id))
      : allTeams.slice(0, 60);

  if (loading) {
    return (
      <LinearGradient
        colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#d7fc5a" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={18}
              color="#aaa"
              style={{ marginRight: 6 }}
            />
            <TextInput
              placeholder="Search teams..."
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.headingRow}>
          <View>
            <Text style={styles.heading}>
              {search ? "Search results" : "My teams"}
            </Text>
            {!search && favTeams.length === 0 && (
              <Text style={styles.helperText}>
                Tap the star to build your team list
              </Text>
            )}
          </View>
          {!search && favTeams.length > 0 && (
            <Text style={styles.countText}>{favTeams.length} saved</Text>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {filteredTeams.map((team) => (
            <View key={team.id} style={styles.item}>
              <TouchableOpacity
                style={styles.teamButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("TeamDetails", { team })}
              >
                <View style={styles.circle}>
                  <Image
                    source={{ uri: team.crest }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavourite(team.id)}
                accessibilityLabel={
                  favTeams.includes(team.id)
                    ? `Remove ${team.name} from favourites`
                    : `Add ${team.name} to favourites`
                }
              >
                <Ionicons
                  name={favTeams.includes(team.id) ? "star" : "star-outline"}
                  size={18}
                  color={favTeams.includes(team.id) ? "#d7fc5a" : "#fff"}
                />
              </TouchableOpacity>
              <Text style={styles.teamName}>{team.shortName || team.name}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 10 : 12,
  },

  searchContainer: {
    marginTop: 10,
    marginBottom: 25,
    marginHorizontal: 16,
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 16,
  },
  heading: { color: "#fff", fontSize: 21, fontWeight: "800" },
  helperText: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
  countText: { color: "#d7fc5a", fontSize: 13, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    height: 38,
    borderRadius: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 6,
  },

  grid: {
    paddingHorizontal: 10,
    paddingBottom: 120,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  item: {
    width: SCREEN_WIDTH / 3.3,
    alignItems: "center",
    marginBottom: 22,
    position: "relative",
  },
  teamButton: { alignItems: "center" },
  favoriteButton: {
    position: "absolute",
    top: -2,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  circle: {
    width: 78,
    height: 78,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  logo: {
    width: 55,
    height: 55,
  },

  teamName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
});
