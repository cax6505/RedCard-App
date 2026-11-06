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
  Share,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { FORMATIONS } from "../utils/footballData";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";
const FALLBACK_PHOTO = "https://cdn.sofifa.net/players/notfound_0_120.png";

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
  const { params } = useRoute();
  const team = params?.team;

  const [formationKey, setFormationKey] = useState("4-3-3");
  const [squad, setSquad] = useState(team?.squad || []);
  const [photos, setPhotos] = useState({});
  const [lineup, setLineup] = useState({});
  const [captainId, setCaptainId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(!team?.squad?.length);
  const [searchFilter, setSearchFilter] = useState("");

  const currentFormation = FORMATIONS[formationKey] || FORMATIONS["4-3-3"];
  const currentSlots = currentFormation.slots;

  useEffect(() => {
    loadTeamAndLineup();
  }, [team?.id]);

  const loadTeamAndLineup = async () => {
    try {
      let nextSquad = team?.squad || [];
      if (!nextSquad.length) {
        const response = await fetch(`https://api.football-data.org/v4/teams/${team.id}`, {
          headers: { "X-Auth-Token": API_KEY },
        });
        if (response.ok) {
          const data = await response.json();
          nextSquad = data.squad || [];
          setSquad(nextSquad);
        }
      }

      const savedFormation = await AsyncStorage.getItem(`lineup_formation_${team?.id}`);
      if (savedFormation && FORMATIONS[savedFormation]) {
        setFormationKey(savedFormation);
      }

      const savedLineup = await AsyncStorage.getItem(`lineup_${team?.id}`);
      if (savedLineup) setLineup(JSON.parse(savedLineup));

      const savedCaptain = await AsyncStorage.getItem(`lineup_captain_${team?.id}`);
      if (savedCaptain) setCaptainId(savedCaptain);
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
  };

  const clearSlot = () => {
    const next = { ...lineup };
    delete next[selectedSlot];
    saveLineup(next);
    setSelectedSlot(null);
  };

  const resetLineup = () => {
    saveLineup({});
    setCaptainId(null);
  };

  const handleShareLineup = async () => {
    try {
      const selectedNames = Object.entries(lineup)
        .map(([slotId, playerId]) => {
          const p = squad.find((s) => s.id === playerId);
          const slot = currentSlots.find((s) => s.id === slotId);
          return `${slot?.label || "P"}: ${p?.name || "Vacant"}`;
        })
        .join("\n");

      await Share.share({
        message: `My ${formationKey} Starting XI for ${team?.shortName || team?.name} on RedCard:\n\n${selectedNames}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const assignedPlayerIds = useMemo(() => new Set(Object.values(lineup)), [lineup]);
  const activeSlotObj = currentSlots.find((s) => s.id === selectedSlot);

  const availablePlayers = useMemo(() => {
    return squad
      .filter((p) => !assignedPlayerIds.has(p.id) || p.id === lineup[selectedSlot])
      .sort((a, b) => {
        const aCompat = isCompatible(a, activeSlotObj?.role);
        const bCompat = isCompatible(b, activeSlotObj?.role);
        return Number(bCompat) - Number(aCompat);
      });
  }, [squad, assignedPlayerIds, lineup, selectedSlot, activeSlotObj]);

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
            <Text style={styles.headerSub}>{team?.shortName || team?.name}</Text>
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
          {/* Formation Selector Pills */}
          <View style={styles.formationPickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formationScroll}>
              {Object.keys(FORMATIONS).map((key) => {
                const isSelected = formationKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.formationPill, isSelected && styles.activeFormationPill]}
                    onPress={() => handleSelectFormation(key)}
                  >
                    <Text style={[styles.formationPillText, isSelected && styles.activeFormationPillText]}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lineup Status Card */}
          <View style={styles.statusBanner}>
            <View>
              <Text style={styles.formationCurrentName}>{currentFormation.name}</Text>
              <Text style={styles.formationSubtitle}>Tap any position token to select player</Text>
            </View>
            <View style={styles.progressBox}>
              <Text style={styles.progressCount}>{filledCount}/11</Text>
              <Text style={styles.progressLabel}>SELECTED</Text>
            </View>
          </View>

          {/* Realistic Tactical Football Pitch */}
          <View style={styles.pitch}>
            {/* Pitch Grass Stripes */}
            <View style={styles.grassStripe1} />
            <View style={styles.grassStripe2} />
            <View style={styles.grassStripe3} />

            {/* Pitch Markings */}
            <View style={styles.pitchHalfway} />
            <View style={styles.pitchCenterCircle} />
            <View style={styles.pitchCenterSpot} />
            <View style={styles.pitchPenaltyTop} />
            <View style={styles.pitchGoalTop} />
            <View style={styles.pitchPenaltyBottom} />
            <View style={styles.pitchGoalBottom} />

            {/* Formation Player Tokens */}
            {currentSlots.map((slot) => {
              const assignedPlayerId = lineup[slot.id];
              const player = squad.find((p) => p.id === assignedPlayerId);
              const isCaptain = player && captainId === player.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotToken, { top: slot.top, left: slot.left }]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSlot(slot.id)}
                >
                  <View style={[styles.playerBadge, player && styles.playerBadgeFilled]}>
                    {player ? (
                      <Text style={styles.playerNumInitial}>
                        {player.shirtNumber || slot.label}
                      </Text>
                    ) : (
                      <Ionicons name="add" size={16} color="#080a0f" />
                    )}

                    {isCaptain && (
                      <View style={styles.captainBadge}>
                        <Text style={styles.captainText}>C</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.slotNamePill}>
                    <Text style={styles.slotPlayerName} numberOfLines={1}>
                      {player ? player.name.split(" ").pop() : slot.label}
                    </Text>
                  </View>
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
          onRequestClose={() => setSelectedSlot(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setSelectedSlot(null)}
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
                    <Ionicons name="trash-outline" size={16} color="#ff2a44" style={{ marginRight: 4 }} />
                    <Text style={styles.clearSlotText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.playerPickerList} showsVerticalScrollIndicator={false}>
                {availablePlayers.map((p) => {
                  const compat = isCompatible(p, activeSlotObj?.role);
                  const isAssigned = lineup[selectedSlot] === p.id;

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.pickerItem, isAssigned && styles.pickerItemActive]}
                      onPress={() => selectPlayer(p)}
                    >
                      <View style={styles.pickerNumberCircle}>
                        <Text style={styles.pickerNumberText}>{p.shirtNumber || "—"}</Text>
                      </View>

                      <View style={styles.pickerInfoCol}>
                        <Text style={styles.pickerName}>{p.name}</Text>
                        <Text style={styles.pickerPos}>{p.position || "Squad"}</Text>
                      </View>

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
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: "row",
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  // Formation Picker
  formationPickerContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  formationScroll: {
    gap: 8,
  },
  formationPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activeFormationPill: {
    backgroundColor: THEME.colors.primary,
  },
  formationPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeFormationPillText: {
    color: "#080a0f",
    fontWeight: "900",
  },

  // Status Banner
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 18,
    padding: 16,
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
  },
  progressBox: {
    alignItems: "center",
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressCount: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.colors.primary,
  },

  // Tactical Pitch Graphic
  pitch: {
    height: 480,
    backgroundColor: "#164023",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.45)",
    position: "relative",
    overflow: "hidden",
  },
  grassStripe1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  grassStripe2: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  grassStripe3: {
    position: "absolute",
    top: "75%",
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  pitchHalfway: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
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
    borderColor: "rgba(255, 255, 255, 0.4)",
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    borderColor: "rgba(255, 255, 255, 0.4)",
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
    borderColor: "rgba(255, 255, 255, 0.4)",
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
    borderColor: "rgba(255, 255, 255, 0.4)",
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
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  // Slot Tokens
  slotToken: {
    position: "absolute",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    alignItems: "center",
    width: 50,
  },
  playerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  playerBadgeFilled: {
    backgroundColor: THEME.colors.primary,
    borderColor: "#080a0f",
  },
  playerNumInitial: {
    fontSize: 11,
    fontWeight: "900",
    color: "#080a0f",
  },
  captainBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffd700",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#080a0f",
  },
  captainText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#080a0f",
  },
  slotNamePill: {
    backgroundColor: "rgba(8, 10, 15, 0.8)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 3,
  },
  slotPlayerName: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: "#121722",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: "75%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
    backgroundColor: "rgba(255, 42, 68, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  clearSlotText: {
    color: "#ff2a44",
    fontSize: 12,
    fontWeight: "800",
  },
  playerPickerList: {
    marginBottom: 20,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 8,
  },
  pickerItemActive: {
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  pickerNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pickerNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.colors.primary,
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
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 1,
  },
  compatChip: {
    backgroundColor: "rgba(0, 230, 118, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compatText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00e676",
  },
  altChip: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  altText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.45)",
  },
});
