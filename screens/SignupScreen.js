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
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { THEME } from "../constants/theme";

export default function SignupScreen() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Please enter a username for your profile.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
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
    } catch (error) {
      console.log("Signup error:", error.code);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("An account already exists for this email.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require("../assets/Messi.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(8, 10, 15, 0.4)", "rgba(8, 10, 15, 0.8)", "#080a0f"]}
          style={styles.gradientOverlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Brand Header */}
              <View style={styles.brandHeader}>
                <View style={styles.brandBadge}>
                  <View style={styles.redCardIcon} />
                </View>
                <Text style={styles.brandTitle}>
                  RED<Text style={styles.brandAccent}>CARD</Text>
                </Text>
                <Text style={styles.brandTagline}>Join millions of football supporters</Text>
              </View>

              {/* Glassmorphic Signup Card */}
              <BlurView intensity={Platform.OS === "ios" ? 70 : 100} tint="dark" style={styles.card}>
                <Text style={styles.cardHeading}>Create Your Account</Text>
                <Text style={styles.cardSub}>Track live games, tactics, and favorite clubs</Text>

                {/* Error Banner */}
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <View style={styles.errorRedCardBadge} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Supporter Username"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.textInput}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Password (min. 6 chars)"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="rgba(255,255,255,0.6)"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#080a0f" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Login link */}
                <TouchableOpacity
                  style={styles.loginLinkBox}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.loginLinkText}>
                    Already have an account?{" "}
                    <Text style={styles.loginLinkAccent}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080a0f" },
  background: { flex: 1, width: "100%", height: "100%" },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 42, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.35)",
  },
  redCardIcon: {
    width: 18,
    height: 24,
    borderRadius: 3,
    backgroundColor: THEME.colors.redCard,
    transform: [{ rotate: "10deg" }],
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  brandAccent: {
    color: THEME.colors.redCard,
  },
  brandTagline: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
    fontWeight: "600",
  },
  card: {
    width: "100%",
    borderRadius: 32,
    padding: 24,
    backgroundColor: "rgba(12, 16, 24, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 15,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
  },
  cardSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 42, 68, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 68, 0.3)",
  },
  errorRedCardBadge: {
    width: 8,
    height: 12,
    borderRadius: 2,
    backgroundColor: THEME.colors.redCard,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#ff6b7e",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  eyeBtn: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#080a0f",
  },
  loginLinkBox: {
    marginTop: 16,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    fontWeight: "600",
  },
  loginLinkAccent: {
    color: THEME.colors.primary,
    fontWeight: "800",
  },
});
