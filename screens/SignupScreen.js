import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || password.length < 6) {
      alert(
        "Enter a username, a valid email, and a password with at least 6 characters.",
      );
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await updateProfile(credential.user, { displayName: username.trim() });
      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          username: username.trim(),
          email: email.trim(),
          favouriteTeamIds: [],
        },
        { merge: true },
      );
      navigation.replace("Home");
    } catch (error) {
      alert(
        error.code === "auth/email-already-in-use"
          ? "An account already exists for this email."
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../assets/Messi.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView intensity={55} tint="dark" style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <TextInput
            placeholder="Username"
            placeholderTextColor="#ccc"
            style={styles.input}
            onChangeText={setUsername}
            value={username}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#ccc"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signupText}>
              Already have an account?{" "}
              <Text style={styles.signupLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "flex-end" },

  card: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    marginBottom: 25,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    color: "#fff",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#EBFF00",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },

  signupText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#fff",
  },

  signupLink: {
    color: "#EBFF00",
    fontWeight: "700",
  },
});
