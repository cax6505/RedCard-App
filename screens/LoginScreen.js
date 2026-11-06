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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { THEME } from "../constants/theme";

export default function LoginScreen() {
  const navigation = useNavigation();

  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation is handled automatically by onAuthStateChanged in AppNavigator
    } catch (error) {
      console.log("Login error:", error.code);
      const messages = {
        "auth/invalid-credential": "The email or password you entered is incorrect.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Try again or reset password.",
        "auth/too-many-requests": "Too many failed attempts. Please try again shortly.",
      };
      setErrorMessage(messages[error.code] || "Unable to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!username.trim()) {
      setErrorMessage("Please enter your supporter username.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
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
        setErrorMessage("An account already exists for this email. Try logging in.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!email.trim()) {
      setErrorMessage("Enter your email above to receive a password reset link.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      setErrorMessage("Unable to send reset instructions for this email address.");
    }
  };

  const handleGuestLogin = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setGuestLoading(true);

    try {
      // Attempt anonymous sign in first
      await signInAnonymously(auth);
    } catch (anonErr) {
      console.log("Anonymous auth error, attempting demo sign in:", anonErr.code);
      try {
        // Fallback demo account
        await signInWithEmailAndPassword(auth, "supporter@redcard.app", "redcard123");
      } catch (demoErr) {
        // If demo account doesn't exist yet, create it automatically
        try {
          const cred = await createUserWithEmailAndPassword(auth, "supporter@redcard.app", "redcard123");
          await updateProfile(cred.user, { displayName: "Guest Supporter" });
        } catch (createErr) {
          setErrorMessage("Guest access temporarily unavailable. Please sign in above.");
        }
      }
    } finally {
      setGuestLoading(false);
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
                <Text style={styles.brandTagline}>Real-Time Pitch Intelligence</Text>
              </View>

              {/* Glassmorphic Auth Card */}
              <BlurView intensity={Platform.OS === "ios" ? 70 : 100} tint="dark" style={styles.card}>
                {/* Auth Mode Toggle Segment */}
                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, authMode === "login" && styles.activeSegmentBtn]}
                    onPress={() => {
                      setAuthMode("login");
                      setErrorMessage("");
                      setInfoMessage("");
                    }}
                  >
                    <Text style={[styles.segmentBtnText, authMode === "login" && styles.activeSegmentBtnText]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, authMode === "signup" && styles.activeSegmentBtn]}
                    onPress={() => {
                      setAuthMode("signup");
                      setErrorMessage("");
                      setInfoMessage("");
                    }}
                  >
                    <Text style={[styles.segmentBtnText, authMode === "signup" && styles.activeSegmentBtnText]}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Banner */}
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <View style={styles.errorRedCardBadge} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Info / Success Banner */}
                {infoMessage ? (
                  <View style={styles.infoBanner}>
                    <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.infoText}>{infoMessage}</Text>
                  </View>
                ) : null}

                {/* Inputs */}
                {authMode === "signup" && (
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
                )}

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

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Password"
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

                {authMode === "signup" && (
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
                )}

                {/* Forgot Password Link (Login only) */}
                {authMode === "login" && (
                  <TouchableOpacity
                    style={styles.forgotPassBtn}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPassText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={authMode === "login" ? handleLogin : handleSignup}
                  disabled={loading || guestLoading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#080a0f" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {authMode === "login" ? "Sign In to Pitch" : "Create Supporter Account"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Continue as Guest Button */}
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={handleGuestLogin}
                  disabled={loading || guestLoading}
                  activeOpacity={0.8}
                >
                  {guestLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="flash-outline" size={18} color={THEME.colors.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.guestButtonText}>Explore Scores as Guest</Text>
                    </>
                  )}
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
    letterSpacing: 0.3,
  },
  card: {
    width: "100%",
    borderRadius: 32,
    padding: 22,
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
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeSegmentBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  activeSegmentBtnText: {
    color: "#ffffff",
    fontWeight: "900",
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(215, 252, 90, 0.3)",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
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
  forgotPassBtn: {
    alignSelf: "flex-end",
    marginBottom: 14,
    marginTop: -2,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#080a0f",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.4)",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
