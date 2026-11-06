import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEME } from "../constants/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [name, setName] = useState(auth.currentUser?.displayName);
  const [photo, setPhoto] = useState(auth.currentUser?.photoURL);
  const [favCount, setFavCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [savedNewsCount, setSavedNewsCount] = useState(0);

  // Settings Toggles
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [goalSound, setGoalSound] = useState(true);
  const [redCardNotifications, setRedCardNotifications] = useState(true);

  useEffect(() => {
    if (route.params?.updatedName) setName(route.params.updatedName);
    if (route.params?.updatedPhoto) setPhoto(route.params.updatedPhoto);
  }, [route.params]);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (auth.currentUser) {
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const ids = snap.data()?.favouriteTeamIds || [];
        setFavCount(ids.length);
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const storedPinned = await AsyncStorage.getItem("redcard_pinned_matches");
      if (storedPinned) setPinnedCount(JSON.parse(storedPinned).length);

      const storedNews = await AsyncStorage.getItem("redcard_saved_news");
      if (storedNews) setSavedNewsCount(JSON.parse(storedNews).length);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (err) {
      console.log("Error signing out:", err);
    }
  };

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

          <Text style={styles.topTitle}>Supporter Profile</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="create-outline" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <LinearGradient
            colors={["#1c2838", "#121926", "#0c1017"]}
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: photo || "https://i.ibb.co/4pDNDk1/avatar.png",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.avatarEditPill}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="camera" size={13} color="#080a0f" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{name || "Football Supporter"}</Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email || "supporter@redcard.app"}</Text>

            <View style={styles.tierBadge}>
              <Ionicons name="shield-checkmark" size={13} color={THEME.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.tierText}>RedCard Fan Tier</Text>
            </View>
          </LinearGradient>

          {/* Fan Stats Dashboard */}
          <View style={styles.statsDashboard}>
            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Favourites")}
            >
              <Text style={styles.statNumber}>{favCount}</Text>
              <Text style={styles.statLabel}>My Clubs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.statNumber}>{pinnedCount}</Text>
              <Text style={styles.statLabel}>Pinned</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("News")}
            >
              <Text style={styles.statNumber}>{savedNewsCount}</Text>
              <Text style={styles.statLabel}>Saved News</Text>
            </TouchableOpacity>
          </View>

          {/* Match & Alert Preferences */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Match Alerts & Notifications</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={20} color={THEME.colors.primary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.settingTitle}>Live Score Ticker</Text>
                  <Text style={styles.settingSub}>Instant goal & halftime alerts</Text>
                </View>
              </View>
              <Switch
                value={liveAlerts}
                onValueChange={setLiveAlerts}
                trackColor={{ false: "#333", true: THEME.colors.primary }}
                thumbColor={Platform.OS === "ios" ? "#fff" : liveAlerts ? "#080a0f" : "#aaa"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="alert-circle-outline" size={20} color={THEME.colors.redCard} style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.settingTitle}>Red Card Alerts</Text>
                  <Text style={styles.settingSub}>Instant alerts for match red cards</Text>
                </View>
              </View>
              <Switch
                value={redCardNotifications}
                onValueChange={setRedCardNotifications}
                trackColor={{ false: "#333", true: THEME.colors.redCard }}
                thumbColor={Platform.OS === "ios" ? "#fff" : redCardNotifications ? "#fff" : "#aaa"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high-outline" size={20} color={THEME.colors.primary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.settingTitle}>Matchday Audio Effects</Text>
                  <Text style={styles.settingSub}>Whistle and stadium roar tones</Text>
                </View>
              </View>
              <Switch
                value={goalSound}
                onValueChange={setGoalSound}
                trackColor={{ false: "#333", true: THEME.colors.primary }}
                thumbColor={Platform.OS === "ios" ? "#fff" : goalSound ? "#080a0f" : "#aaa"}
              />
            </View>
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quick Access</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate("Favourites")}
            >
              <View style={styles.actionLeft}>
                <MaterialCommunityIcons name="shield-star" size={20} color={THEME.colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.actionText}>Manage Favorite Teams</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate("Standings")}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="trophy-outline" size={20} color="#ffd700" style={{ marginRight: 10 }} />
                <Text style={styles.actionText}>League Tables & Top Scorers</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <View style={styles.accountButtonsContainer}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons name="create-outline" size={18} color="#080a0f" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#ff2a44" />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>RedCard Football App • Version 1.2.0</Text>
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
  topTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarContainer: {
    position: "relative",
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
  },
  avatarEditPill: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#080a0f",
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
  },
  userEmail: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 3,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  tierText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  statsDashboard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 3,
  },
  sectionCard: {
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  settingSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  accountButtonsContainer: {
    gap: 10,
    marginTop: 8,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#080a0f",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 42, 68, 0.12)",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.25)",
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ff2a44",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.35)",
    marginTop: 18,
  },
});
