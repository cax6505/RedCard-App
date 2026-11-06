import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

export default function FooterDock({ currentRoute: propCurrentRoute }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Try to get route from navigation state or prop
  const stateRoute = useNavigationState((state) => {
    if (!state) return null;
    const route = state.routes[state.index];
    return route ? route.name : null;
  });

  const activeRoute = propCurrentRoute || stateRoute || "Home";

  const tabs = [
    {
      name: "Home",
      label: "Matches",
      icon: "football",
      iconFamily: "Ionicons",
    },
    {
      name: "Standings",
      label: "Standings",
      icon: "stats-chart",
      iconFamily: "Ionicons",
    },
    {
      name: "Favourites",
      label: "Clubs",
      icon: "shield-star",
      iconFamily: "MaterialCommunityIcons",
    },
    {
      name: "News",
      label: "News",
      icon: "newspaper",
      iconFamily: "Ionicons",
    },
    {
      name: "Profile",
      label: "Profile",
      icon: "person",
      iconFamily: "Ionicons",
    },
  ];

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View
        style={[
          styles.dockFooter,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.footerIcons}>
          {tabs.map((tab) => {
            const isActive = activeRoute === tab.name;
            const color = isActive ? THEME.colors.primary : THEME.colors.textMuted;

            return (
              <TouchableOpacity
                key={tab.name}
                activeOpacity={0.7}
                style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}
                onPress={() => navigation.navigate(tab.name)}
              >
                <View style={styles.iconContainer}>
                  {tab.iconFamily === "MaterialCommunityIcons" ? (
                    <MaterialCommunityIcons name={tab.icon} size={24} color={color} />
                  ) : (
                    <Ionicons name={tab.icon} size={24} color={color} />
                  )}

                  {tab.name === "Home" && (
                    <View style={styles.liveBadgeDot} />
                  )}
                </View>

                <Text
                  style={[
                    styles.footerLabel,
                    { color },
                    isActive && styles.activeFooterLabel,
                  ]}
                >
                  {tab.label}
                </Text>

                {isActive && <View style={styles.activePillIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dockFooter: {
    width: "92%",
    maxWidth: 440,
    marginBottom: Platform.OS === "ios" ? 10 : 16,
    backgroundColor: "rgba(12, 16, 24, 0.94)",
    borderRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconWrapper: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    position: "relative",
  },
  activeIconWrapper: {
    transform: [{ scale: 1.04 }],
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadgeDot: {
    position: "absolute",
    top: -2,
    right: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff2a44",
  },
  footerLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  activeFooterLabel: {
    fontWeight: "800",
  },
  activePillIndicator: {
    position: "absolute",
    bottom: -6,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
});
