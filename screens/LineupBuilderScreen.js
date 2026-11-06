import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { FORMATIONS, getPlayerFace } from "../utils/footballData";
import { SafeCrest, SafePlayerFace } from "../components/SafeImage";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const normalisePosition = (position = "") => position.toLowerCase();

const isCompatible = (player, role) => {
  if (!role) return true;
  const position = normalisePosition(player.position);
  if (role === "GK") return position.includes("goalkeeper") || position.includes("keeper");
  if (role === "CB" || role === "LB" || role === "RB" || role === "LWB" || role === "RWB") {
    return position.includes("defen") || position.includes("back");
  }
  if (role.includes("M") || role === "CAM" || role === "CDM" || role === "CM") {
    return position.includes("midfield");
  }
  return (
    position.includes("attack") ||
    position.includes("forward") ||
    position.includes("wing") ||
    position.includes("striker")
  );
};

export default function LineupBuilderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const team = route.params?.team || {};

  const [formationKey, setFormationKey] = useState("4-3-3");
  const [squad, setSquad] = useState(team?.squad || []);
  const [lineup, setLineup] = useState({});
  const [captainId, setCaptainId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(!team?.squad?.length);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  const currentFormation = FORMATIONS[formationKey] || FORMATIONS["4-3-3"];
  const currentSlots = currentFormation.slots || [];

  useEffect(() => {
    loadTeamAndLineup();
  }, [team?.id]);

  const loadTeamAndLineup = async () => {
    try {
      let nextSquad = team?.squad || [];
      if (!nextSquad.length && team?.id) {
        const response = await fetch(`https://api.football-data.org/v4/teams/${team.id}`, {
          headers: { "X-Auth-Token": API_KEY },
        });
        if (response.ok) {
          const data = await response.json();
          nextSquad = data.squad || [];
          setSquad(nextSquad);
        }
      }

      if (team?.id) {
        const savedFormation = await AsyncStorage.getItem(`lineup_formation_${team.id}`);
        if (savedFormation && FORMATIONS[savedFormation]) {
          setFormationKey(savedFormation);
        }

        const savedLineup = await AsyncStorage.getItem(`lineup_${team.id}`);
        if (savedLineup) setLineup(JSON.parse(savedLineup));

        const savedCaptain = await AsyncStorage.getItem(`lineup_captain_${team.id}`);
        if (savedCaptain) setCaptainId(savedCaptain);
      }
    } catch (error) {
      console.log("Lineup load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLineup = async (nextLineup, nextFormation = formationKey, nextCaptain = captainId) => {
    setLineup(nextLineup);
    if (team?.id) {
      await AsyncStorage.setItem(`lineup_${team.id}`, JSON.stringify(nextLineup));
      await AsyncStorage.setItem(`lineup_formation_${team.id}`, nextFormation);
      if (nextCaptain) await AsyncStorage.setItem(`lineup_captain_${team.id}`, nextCaptain);
    }
  };

  const handleSelectFormation = (key) => {
    setFormationKey(key);
    saveLineup(lineup, key);
  };

  const selectPlayer = (player) => {
    const next = { ...lineup, [selectedSlot]: player.id };
    saveLineup(next);
    setSelectedSlot(null);
    setPlayerSearchQuery("");
  };

  const clearSlot = () => {
    const next = { ...lineup };
    delete next[selectedSlot];
    saveLineup(next);
    setSelectedSlot(null);
    setPlayerSearchQuery("");
  };

  const resetLineup = () => {
    saveLineup({});
    setCaptainId(null);
  };

  const handleToggleCaptain = (playerId) => {
    const nextCaptain = captainId === playerId ? null : playerId;
    setCaptainId(nextCaptain);
    saveLineup(lineup, formationKey, nextCaptain);
  };

  const handleShareLineup = async () => {
    try {
      const selectedNames = Object.entries(lineup)
        .map(([slotId, playerId]) => {
          const p = squad.find((s) => s.id === playerId);
          const slot = currentSlots.find((s) => s.id === slotId);
          const cap = captainId === playerId ? " (C)" : "";
          return `${slot?.label || "P"}: ${p?.name || "Vacant"}${cap}`;
        })
        .join("\n");

      await Share.share({
        message: `My ${formationKey} Starting XI for ${team?.shortName || team?.name || "Club"}:\n\n${selectedNames}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const assignedPlayerIds = useMemo(() => new Set(Object.values(lineup)), [lineup]);
  const activeSlotObj = currentSlots.find((s) => s.id === selectedSlot);

  const availablePlayers = useMemo(() => {
    return squad
      .filter((p) => {
        const matchesAssignment = !assignedPlayerIds.has(p.id) || p.id === lineup[selectedSlot];
        const matchesSearch = playerSearchQuery
          ? p.name.toLowerCase().includes(playerSearchQuery.toLowerCase())
          : true;
        return matchesAssignment && matchesSearch;
      })
      .sort((a, b) => {
        const aCompat = isCompatible(a, activeSlotObj?.role);
        const bCompat = isCompatible(b, activeSlotObj?.role);
        return Number(bCompat) - Number(aCompat);
      });
  }, [squad, assignedPlayerIds, lineup, selectedSlot, activeSlotObj, playerSearchQuery]);

  const filledCount = Object.keys(lineup).length;

  if (loading) {
    return (
      <LinearGradient colors={THEME.colors.gradientBackground} style={styles.centerLoading}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Setting up tactical board...</Text>
      </LinearGradient>
    );
  }

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

          <View style={styles.titleBox}>
            <Text style={styles.headerTitle}>Tactical Board</Text>
            <View style={styles.teamSubtitleRow}>
              {team?.crest && (
                <SafeCrest source={{ uri: team.crest }} name={team?.shortName} size={14} style={{ marginRight: 5 }} />
              )}
              <Text style={styles.headerSub}>{team?.shortName || team?.name || "Starting XI"}</Text>
            </View>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity style={styles.circleBtn} onPress={handleShareLineup}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleBtn} onPress={resetLineup}>
              <Ionicons name="refresh-outline" size={20} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Tactical Formations Horizontal Picker */}
          <View style={styles.formationPickerContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.formationScroll}
            >
              {Object.keys(FORMATIONS).map((key) => {
                const isSelected = formationKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.formationPill, isSelected && styles.activeFormationPill]}
                    onPress={() => handleSelectFormation(key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.formationPillText,
                        isSelected && styles.activeFormationPillText,
                      ]}
                    >
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lineup Status Card */}
          <View style={styles.statusBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formationCurrentName}>{currentFormation.name}</Text>
              <Text style={styles.formationSubtitle}>
                {currentFormation.description || "Tap any position token to select player"}
              </Text>
            </View>
            <View style={styles.progressBox}>
              <Text style={styles.progressCount}>{filledCount}/11</Text>
              <Text style={styles.progressLabel}>SELECTED</Text>
            </View>
          </View>

          {/* Realistic Tactical Football Pitch */}
          <View style={styles.pitch}>
            {/* Pitch Markings */}
            <View style={styles.pitchHalfway} />
            <View style={styles.pitchCenterCircle} />
            <View style={styles.pitchCenterSpot} />
            <View style={styles.pitchPenaltyTop} />
            <View style={styles.pitchGoalTop} />
            <View style={styles.pitchPenaltyBottom} />
            <View style={styles.pitchGoalBottom} />

            {/* Formation Player Tokens with REAL Player Faces */}
            {currentSlots.map((slot) => {
              const assignedPlayerId = lineup[slot.id];
              const player = squad.find((p) => p.id === assignedPlayerId);
              const isCaptain = player && captainId === player.id;
              const playerFaceUrl = player ? getPlayerFace(player.name) : null;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotToken, { top: slot.top, left: slot.left }]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSlot(slot.id)}
                >
                  {player ? (
                    <View style={styles.tokenWithPlayer}>
                      <SafePlayerFace
                        uri={playerFaceUrl}
                        name={player.name}
                        number={player.shirtNumber}
                        size={42}
                        borderColor={THEME.colors.primary}
                      />
                      {isCaptain && (
                        <View style={styles.captainBadge}>
                          <Text style={styles.captainText}>C</Text>
                        </View>
                      )}
                      <View style={styles.slotNamePill}>
                        <Text style={styles.slotPlayerName} numberOfLines={1}>
                          {player.name ? player.name.split(" ").pop() : slot.label}
                        </Text>
                      </View>
                      <Text style={styles.slotRoleTag}>{slot.label}</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyTokenContainer}>
                      <View style={styles.emptyTokenCircle}>
                        <Ionicons name="add" size={18} color={THEME.colors.primary} />
                      </View>
                      <View style={styles.emptySlotLabelPill}>
                        <Text style={styles.emptySlotLabelText}>{slot.label}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Player Picker Modal Sheet */}
        <Modal
          visible={Boolean(selectedSlot)}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setSelectedSlot(null);
            setPlayerSearchQuery("");
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setSelectedSlot(null);
                setPlayerSearchQuery("");
              }}
            />

            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalSheetTitle}>Choose {activeSlotObj?.label}</Text>
                  <Text style={styles.modalSheetSub}>
                    Recommended for {activeSlotObj?.role} role
                  </Text>
                </View>

                {lineup[selectedSlot] && (
                  <TouchableOpacity style={styles.clearSlotBtn} onPress={clearSlot}>
                    <Ionicons name="trash-outline" size={15} color="#ff2a44" style={{ marginRight: 4 }} />
                    <Text style={styles.clearSlotText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Player Search Input */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Filter squad members..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={playerSearchQuery}
                  onChangeText={setPlayerSearchQuery}
                  style={styles.searchInput}
                  clearButtonMode="while-editing"
                />
              </View>

              <ScrollView style={styles.playerPickerList} showsVerticalScrollIndicator={false}>
                {availablePlayers.map((p) => {
                  const compat = isCompatible(p, activeSlotObj?.role);
                  const isAssigned = lineup[selectedSlot] === p.id;
                  const isCurrentCap = captainId === p.id;
                  const playerPhoto = getPlayerFace(p.name);

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.pickerItem, isAssigned && styles.pickerItemActive]}
                      onPress={() => selectPlayer(p)}
                      activeOpacity={0.8}
                    >
                      {/* Player Face Photo */}
                      <SafePlayerFace
                        uri={playerPhoto}
                        name={p.name}
                        number={p.shirtNumber}
                        size={38}
                        style={{ marginRight: 12 }}
                      />

                      <View style={styles.pickerInfoCol}>
                        <Text style={styles.pickerName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.pickerPos}>
                          {p.position || "Squad Member"} {p.shirtNumber ? `• #${p.shirtNumber}` : ""}
                        </Text>
                      </View>

                      {/* Captain Action */}
                      <TouchableOpacity
                        style={[styles.capButton, isCurrentCap && styles.activeCapButton]}
                        onPress={() => handleToggleCaptain(p.id)}
                      >
                        <Text style={[styles.capButtonText, isCurrentCap && styles.activeCapButtonText]}>
                          {isCurrentCap ? "CAPTAIN" : "MAKE CAP"}
                        </Text>
                      </TouchableOpacity>

                      {compat ? (
                        <View style={styles.compatChip}>
                          <Text style={styles.compatText}>Ideal</Text>
                        </View>
                      ) : (
                        <View style={styles.altChip}>
                          <Text style={styles.altText}>Alt</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
  titleBox: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
  },
  teamSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },
  topRightActions: {
    flexDirection: "row",
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  formationPickerContainer: {
    marginTop: 6,
    marginBottom: 12,
  },
  formationScroll: {
    gap: 8,
  },
  formationPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activeFormationPill: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  formationPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeFormationPillText: {
    color: "#080a0f",
  },
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  formationCurrentName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#fff",
  },
  formationSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
    paddingRight: 10,
  },
  progressBox: {
    alignItems: "center",
    backgroundColor: "rgba(215, 252, 90, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.colors.primary,
    marginTop: 1,
  },

  // Tactical Pitch
  pitch: {
    height: 520,
    backgroundColor: "#13381c",
    borderRadius: 24,
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
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: -45,
    marginLeft: -45,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pitchCenterSpot: {
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
    left: "24%",
    right: "24%",
    height: 65,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pitchGoalTop: {
    position: "absolute",
    top: 0,
    left: "36%",
    right: "36%",
    height: 26,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pitchPenaltyBottom: {
    position: "absolute",
    bottom: 0,
    left: "24%",
    right: "24%",
    height: 65,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pitchGoalBottom: {
    position: "absolute",
    bottom: 0,
    left: "36%",
    right: "36%",
    height: 26,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Pitch Slots
  slotToken: {
    position: "absolute",
    transform: [{ translateX: -26 }, { translateY: -26 }],
    alignItems: "center",
    width: 52,
  },
  tokenWithPlayer: {
    alignItems: "center",
    position: "relative",
  },
  captainBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#ffd600",
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#080a0f",
  },
  captainText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#080a0f",
  },
  slotNamePill: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
    maxWidth: 58,
  },
  slotPlayerName: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  slotRoleTag: {
    fontSize: 8,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
  },
  emptyTokenContainer: {
    alignItems: "center",
  },
  emptyTokenCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    borderStyle: "dashed",
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlotLabelPill: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  emptySlotLabelText: {
    fontSize: 9,
    fontWeight: "900",
    color: THEME.colors.primary,
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalSheet: {
    backgroundColor: "#101622",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  modalSheetSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  clearSlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 42, 68, 0.15)",
  },
  clearSlotText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ff2a44",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    padding: 0,
  },
  playerPickerList: {
    maxHeight: 360,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 8,
  },
  pickerItemActive: {
    backgroundColor: "rgba(215, 252, 90, 0.12)",
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  pickerInfoCol: {
    flex: 1,
  },
  pickerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  pickerPos: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  capButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  activeCapButton: {
    backgroundColor: "#ffd600",
  },
  capButtonText: {
    fontSize: 9,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.8)",
  },
  activeCapButtonText: {
    color: "#080a0f",
  },
  compatChip: {
    backgroundColor: "rgba(0, 230, 118, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compatText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00e676",
  },
  altChip: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  altText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.45)",
  },
});
