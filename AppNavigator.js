import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import GetStarted from "./screens/GetStarted";
import HomeScreen from "./screens/HomeScreen";
import StandingsScreen from "./screens/StandingsScreen";
import FavouriteTeamsScreen from "./screens/FavouriteTeamsScreen";
import NewsScreen from "./screens/NewsScreen";
import TeamDetailsScreen from "./screens/TeamDetailsScreen";
import FooterDock from "./components/FooterDock";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import MatchDetailsScreen from "./screens/MatchDetailsScreen";
import LineupBuilderScreen from "./screens/LineupBuilderScreen";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [currentRoute, setCurrentRoute] = useState("GetStarted");
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#10110d",
          }}
        >
          <ActivityIndicator size="large" color="#d7fc5a" />
        </View>
      </SafeAreaProvider>
    );
  }

  const hideFooterScreens = ["GetStarted", "Login", "Signup"];
  const shouldShowFooter =
    Boolean(user) && !hideFooterScreens.includes(currentRoute);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        onStateChange={(state) => {
          const route = state?.routes[state.index]?.name;
          if (route) setCurrentRoute(route);
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                <>
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Standings" component={StandingsScreen} />
                  <Stack.Screen
                    name="Favourites"
                    component={FavouriteTeamsScreen}
                  />
                  <Stack.Screen name="News" component={NewsScreen} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                  />
                  <Stack.Screen
                    name="TeamDetails"
                    component={TeamDetailsScreen}
                  />
                  <Stack.Screen
                    name="MatchDetails"
                    component={MatchDetailsScreen}
                  />
                  <Stack.Screen
                    name="LineupBuilder"
                    component={LineupBuilderScreen}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen name="GetStarted" component={GetStarted} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Signup" component={SignupScreen} />
                </>
              )}
            </Stack.Navigator>
          </View>
          {shouldShowFooter && <FooterDock currentRoute={currentRoute} />}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
