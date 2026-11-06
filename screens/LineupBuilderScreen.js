import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";
const FALLBACK_PHOTO = "https://cdn.sofifa.net/players/notfound_0_120.png";

const FORMATION_SLOTS = [
  { id: "goalkeeper", role: "GK", top: "86%", left: "50%" },
  { id: "left-back", role: "LB", top: "68%", left: "15%" },
  { id: "centre-back-left", role: "CB", top: "70%", left: "38%" },
  { id: "centre-back-right", role: "CB", top: "70%", left: "62%" },
  { id: "right-back", role: "RB", top: "68%", left: "85%" },
  { id: "left-midfielder", role: "CM", top: "48%", left: "22%" },
  { id: "centre-midfielder", role: "CM", top: "43%", left: "50%" },
  { id: "right-midfielder", role: "CM", top: "48%", left: "78%" },
  { id: "left-winger", role: "LW", top: "22%", left: "18%" },
  { id: "striker", role: "ST", top: "14%", left: "50%" },
  { id: "right-winger", role: "RW", top: "22%", left: "82%" },
];

const normalisePosition = (position = "") => position.toLowerCase();

const isCompatible = (player, role) => {
  const position = normalisePosition(player.position);
  if (role === "GK") return position.includes("goalkeeper");
  if (role === "CB" || role === "LB" || role === "RB") {
    return position.includes("defen") || position.includes("back");
  }
  if (role === "CM") return position.includes("midfield");
  return (
    position.includes("attack") ||
    position.includes("forward") ||
    position.includes("wing")
  );
};

export default function LineupBuilderScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const team = params?.team;
  const [squad, setSquad] = useState(team?.squad || []);
  const [photos, setPhotos] = useState({});
  const [lineup, setLineup] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(!team?.squad?.length);
  const [photoLoading, setPhotoLoading] = useState(true);

  useEffect(() => {
    loadTeamAndLineup();
  }, [team?.id]);

  useEffect(() => {
    if (squad.length) loadPhotos(squad);
  }, [squad.length]);

  const loadTeamAndLineup = async () => {
    try {
      let nextSquad = team?.squad || [];
      if (!nextSquad.length) {
        const response = await fetch(
          `https://api.football-data.org/v4/teams/${team.id}`,
          {
            headers: { "X-Auth-Token": API_KEY },
          },
        );
        if (!response.ok) throw new Error("Unable to load squad");
        const data = await response.json();
        nextSquad = data.squad || [];
        setSquad(nextSquad);
      }
      const saved = await AsyncStorage.getItem(`lineup_${team.id}`);
      if (saved) setLineup(JSON.parse(saved));
    } catch (error) {
      console.log("Lineup load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (players) => {
    setPhotoLoading(true);
    const cacheKey = `player_photos_${team.id}`;
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      const cachedPhotos = cached ? JSON.parse(cached) : {};
      const missingPlayers = players.filter(
        (player) => !cachedPhotos[player.id],
      );
      const resolved = await Promise.all(
        missingPlayers.map(async (player) => {
          try {
            const response = await fetch(
              `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(player.name)}`,
            );
            const data = await response.json();
            const result = data?.player?.[0];
            return [player.id, result?.strCutout || result?.strThumb || null];
          } catch {
            return [player.id, null];
          }
        }),
      );
      const nextPhotos = { ...cachedPhotos, ...Object.fromEntries(resolved) };
      setPhotos(nextPhotos);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(nextPhotos));
    } catch (error) {
      console.log("Player photo error:", error);
    } finally {
      setPhotoLoading(false);
    }
  };

  const assignedIds = useMemo(() => new Set(Object.values(lineup)), [lineup]);
  const selectedPlayer = squad.find(
    (player) => player.id === lineup[selectedSlot],
  );
  const availablePlayers = squad
    .filter(
      (player) =>
        !assignedIds.has(player.id) || player.id === selectedPlayer?.id,
    )
    .sort((first, second) => {
      const firstMatch =
        selectedSlot &&
        isCompatible(
          first,
          FORMATION_SLOTS.find((slot) => slot.id === selectedSlot)?.role,
        );
      const secondMatch =
        selectedSlot &&
        isCompatible(
          second,
          FORMATION_SLOTS.find((slot) => slot.id === selectedSlot)?.role,
        );
      return Number(secondMatch) - Number(firstMatch);
    });

  const saveLineup = async (nextLineup) => {
    setLineup(nextLineup);
    await AsyncStorage.setItem(`lineup_${team.id}`, JSON.stringify(nextLineup));
  };

  const selectPlayer = async (player) => {
    const nextLineup = { ...lineup, [selectedSlot]: player.id };
    await saveLineup(nextLineup);
    setSelectedSlot(null);
  };

  const clearSlot = async () => {
    const nextLineup = { ...lineup };
    delete nextLineup[selectedSlot];
    await saveLineup(nextLineup);
    setSelectedSlot(null);
  };

  const resetLineup = async () => {
    await saveLineup({});
  };

  if (loading) {
    return (
      <LinearGradient colors={["#3b3d0e", "#0f0f0d"]} style={styles.loader}>
        <ActivityIndicator size="large" color="#d7fc5a" />
      </LinearGradient>
    );
  }

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
          <View>
            <Text style={styles.headerTitle}>Lineup Builder</Text>
            <Text style={styles.headerSubtitle}>
              {team?.shortName || team?.name}
            </Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetLineup}>
            <Ionicons name="refresh-outline" size={19} color="#d7fc5a" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.builderHeader}>
            <View>
              <Text style={styles.eyebrow}>YOUR XI</Text>
              <Text style={styles.builderTitle}>4-3-3 formation</Text>
            </View>
            <Text style={styles.progress}>{Object.keys(lineup).length}/11</Text>
          </View>

          {!squad.length && (
            <View style={styles.emptySquad}>
              <Ionicons name="alert-circle-outline" size={24} color="#d7fc5a" />
              <Text style={styles.emptySquadTitle}>Squad data unavailable</Text>
              <Text style={styles.emptySquadText}>
                Refresh the team page and try again when the provider is
                reachable.
              </Text>
            </View>
          )}

          <View style={styles.pitch}>
            <View style={styles.halfwayLine} />
            <View style={styles.centerCircle} />
            <View style={styles.goalTop} />
            <View style={styles.goalBottom} />
            {FORMATION_SLOTS.map((slot) => {
              const player = squad.find(
                (candidate) => candidate.id === lineup[slot.id],
              );
              const photo = player ? photos[player.id] || FALLBACK_PHOTO : null;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slot, { top: slot.top, left: slot.left }]}
                  onPress={() => setSelectedSlot(slot.id)}
                  accessibilityLabel={
                    player ? `Change ${player.name}` : `Choose ${slot.role}`
                  }
                >
                  <View
                    style={[
                      styles.playerToken,
                      player && styles.playerTokenFilled,
                    ]}
                  >
                    {player ? (
                      <Image
                        source={{ uri: photo }}
                        style={styles.tokenPhoto}
                      />
                    ) : (
                      <Ionicons name="add" size={20} color="#0f0f0d" />
                    )}
                  </View>
                  <Text style={styles.slotLabel} numberOfLines={1}>
                    {player?.name || slot.role}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tipRow}>
            <Ionicons name="hand-left-outline" size={18} color="#d7fc5a" />
            <Text style={styles.tipText}>
              Tap a position to choose a player. Your lineup saves
              automatically.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Squad available</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.benchRow}
          >
            {squad
              .filter((player) => !assignedIds.has(player.id))
              .map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.benchPlayer}
                  onPress={() => setSelectedSlot("striker")}
                >
                  <Image
                    source={{ uri: photos[player.id] || FALLBACK_PHOTO }}
                    style={styles.benchPhoto}
                  />
                  <Text style={styles.benchName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={styles.benchPosition}>
                    {player.position || "Squad"}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
          {photoLoading && (
            <Text style={styles.photoStatus}>Loading player portraits...</Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={Boolean(selectedSlot)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSlot(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setSelectedSlot(null)}
          />
          <View style={styles.playerPicker}>
            <View style={styles.modalHandle} />
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>
                  Choose{" "}
                  {
                    FORMATION_SLOTS.find((slot) => slot.id === selectedSlot)
                      ?.role
                  }
                </Text>
                <Text style={styles.pickerSubtitle}>
                  Available squad members
                </Text>
              </View>
              {lineup[selectedSlot] && (
                <TouchableOpacity onPress={clearSlot}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView contentContainerStyle={styles.pickerList}>
              {availablePlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.pickerPlayer}
                  onPress={() => selectPlayer(player)}
                >
                  <Image
                    source={{ uri: photos[player.id] || FALLBACK_PHOTO }}
                    style={styles.pickerPhoto}
                  />
                  <View style={styles.pickerPlayerInfo}>
                    <Text style={styles.pickerPlayerName}>{player.name}</Text>
                    <Text style={styles.pickerPlayerPosition}>
                      {player.position || "Position unavailable"}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#d7fc5a"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  resetButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(215,252,90,0.12)",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  content: { padding: 20, paddingBottom: 130 },
  builderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#d7fc5a",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  builderTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },
  progress: { color: "#d7fc5a", fontSize: 20, fontWeight: "900" },
  emptySquad: {
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  emptySquadTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },
  emptySquadText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 4,
  },
  pitch: {
    height: 475,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#397c45",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.48)",
  },
  halfwayLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 78,
    height: 78,
    marginLeft: -39,
    marginTop: -39,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  goalTop: {
    position: "absolute",
    top: 0,
    left: "28%",
    right: "28%",
    height: 55,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "rgba(255,255,255,0.55)",
  },
  goalBottom: {
    position: "absolute",
    bottom: 0,
    left: "28%",
    right: "28%",
    height: 55,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.55)",
  },
  slot: {
    position: "absolute",
    width: 74,
    marginLeft: -37,
    alignItems: "center",
  },
  playerToken: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d7fc5a",
    borderWidth: 2,
    borderColor: "#fff",
  },
  playerTokenFilled: { backgroundColor: "#0f0f0d" },
  tokenPhoto: { width: 38, height: 38, borderRadius: 19 },
  slotLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 3,
    textShadowColor: "#0f0f0d",
    textShadowRadius: 3,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tipText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 25,
    marginBottom: 12,
  },
  benchRow: { gap: 12 },
  benchPlayer: { width: 92, alignItems: "center" },
  benchPhoto: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  benchName: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  benchPosition: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  photoStatus: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBackdrop: { flex: 1 },
  playerPicker: {
    maxHeight: "72%",
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 25,
  },
  modalHandle: {
    width: 58,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  pickerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  pickerSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 3,
  },
  clearText: { color: "#ff7777", fontWeight: "800" },
  pickerList: { paddingHorizontal: 20, paddingBottom: 20 },
  pickerPlayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  pickerPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pickerPlayerInfo: { flex: 1, marginLeft: 12 },
  pickerPlayerName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  pickerPlayerPosition: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 3,
  },
});
