import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export default function TeamDetailsScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { team } = params;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [team?.id]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/teams/${team.id}`,
        {
          headers: { "X-Auth-Token": API_KEY },
        },
      );
      const data = await res.json();
      setDetails(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerPhoto = async (playerName) => {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(
        playerName,
      )}`;

      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();

      const player = data?.player?.[0];
      return (
        player?.strCutout || player?.strThumb || player?.strFanart1 || null
      );
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

  if (loading) {
    return (
      <LinearGradient
        colors={["#3b3d0e", "#0f0f0d"]}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#d7fc5a" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1, paddingTop: Platform.OS === "ios" ? 60 : 50 }}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.titleText}>{details?.shortName || "Team"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.teamBox}>
          <Image
            source={{ uri: details?.crest || undefined }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.fullName}>{details?.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Club Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Venue</Text>
            <Text style={styles.value}>{details?.venue || "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{details?.address || "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Website</Text>
            <Text
              style={styles.link}
              onPress={() => {
                if (details?.website) Linking.openURL(details.website);
              }}
            >
              {details?.website || "—"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Squad</Text>
          <TouchableOpacity
            style={styles.lineupButton}
            onPress={() =>
              navigation.navigate("LineupBuilder", { team: details })
            }
          >
            <Ionicons name="football-outline" size={17} color="#0f0f0d" />
            <Text style={styles.lineupButtonText}>Build lineup</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.squadCard}>
          {details?.squad?.length > 0 ? (
            details.squad.map((p) => (
              <TouchableOpacity
                key={p.id ?? `${p.name}-${Math.random()}`}
                style={styles.playerRow}
                activeOpacity={0.75}
                onPress={() => handleSelectPlayer(p)}
              >
                <View>
                  <Text style={styles.playerName}>{p.name}</Text>
                  <Text style={styles.playerPos}>{p.position || "—"}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSquad}>Squad info not available</Text>
          )}
        </View>
      </ScrollView>

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
            style={styles.modalBackdropTouchable}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              setSelectedPlayer(null);
            }}
          />

          <View style={styles.modalSheet}>
            <View style={styles.dragIndicator} />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                setModalVisible(false);
                setSelectedPlayer(null);
              }}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>

            {modalLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#d7fc5a" />
                <Text style={{ color: "#fff", marginTop: 10 }}>
                  Loading player...
                </Text>
              </View>
            ) : selectedPlayer ? (
              <View style={styles.modalContent}>
                <Image
                  source={{
                    uri:
                      selectedPlayer.photo ||
                      "https://cdn.sofifa.net/players/notfound_0_120.png",
                  }}
                  style={styles.playerPhoto}
                />

                <Text style={styles.modalPlayerName}>
                  {selectedPlayer.name}
                </Text>

                <View style={styles.modalInfoBox}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Position</Text>
                    <Text style={styles.modalValue}>
                      {selectedPlayer.position || "—"}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Role</Text>
                    <Text style={styles.modalValue}>
                      {selectedPlayer.role || "—"}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Nationality</Text>
                    <Text style={styles.modalValue}>
                      {selectedPlayer.nationality || "—"}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Date of Birth</Text>
                    <Text style={styles.modalValue}>
                      {selectedPlayer.dateOfBirth || "—"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.modalLoading}>
                <Text style={{ color: "#fff" }}>No player selected</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    alignItems: "center",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  teamBox: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 12,
  },
  fullName: {
    color: "#fff",
    fontSize: 22,
    marginTop: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  infoCard: {
    margin: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    color: "#d7fc5a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    color: "#d7fc5a",
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: "#fff",
    fontSize: 15,
    marginTop: 2,
  },
  link: {
    color: "#8CE0FF",
    fontSize: 15,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#d7fc5a",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
  },
  lineupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d7fc5a",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  lineupButtonText: {
    color: "#0f0f0d",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },
  squadCard: {
    margin: 20,
    borderRadius: 18,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  playerRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playerName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  playerPos: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 3,
  },
  noSquad: {
    color: "#ccc",
    padding: 20,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    paddingBottom: 34,
    minHeight: 260,
    maxHeight: "75%",
  },
  dragIndicator: {
    width: 60,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalClose: {
    position: "absolute",
    right: 14,
    top: 12,
    zIndex: 10,
    padding: 6,
  },
  modalLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  modalContent: {
    alignItems: "center",
    paddingHorizontal: 22,
    marginTop: 6,
  },
  playerPhoto: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  modalPlayerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalInfoBox: {
    width: "100%",
    marginTop: 6,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalLabel: {
    color: "#d7fc5a",
    fontSize: 13,
    fontWeight: "600",
  },
  modalValue: {
    color: "#fff",
    fontSize: 13,
  },
});
