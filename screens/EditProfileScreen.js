import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || "");
  const [image, setImage] = useState(user?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Error picking image:", err);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      let photoURL = image || user?.photoURL;

      if (image && !image.startsWith("http")) {
        try {
          const response = await fetch(image);
          const imgBlob = await response.blob();
          const imgRef = ref(storage, `profilePics/${user.uid}.jpg`);
          await uploadBytes(imgRef, imgBlob);
          photoURL = await getDownloadURL(imgRef);
        } catch (uploadErr) {
          console.log("Storage upload error, using local/existing uri:", uploadErr);
        }
      }

      await updateProfile(user, { displayName: username, photoURL });

      await setDoc(
        doc(db, "users", user.uid),
        {
          username,
          photoURL,
          email: user.email,
        },
        { merge: true },
      );

      navigation.navigate("Profile", {
        updatedName: username,
        updatedPhoto: photoURL,
      });
    } catch (err) {
      console.log("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Edit Supporter Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contentContainer}>
          <LinearGradient
            colors={["#1c2838", "#121926", "#0c1017"]}
            style={styles.card}
          >
            {/* Avatar with Camera Overlay */}
            <TouchableOpacity activeOpacity={0.85} onPress={pickImage} style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: image || "https://i.ibb.co/4pDNDk1/avatar.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraPill}>
                <Ionicons name="camera" size={15} color="#080a0f" />
              </View>
            </TouchableOpacity>

            <Text style={styles.changePhotoText}>Tap photo to choose custom image</Text>

            {/* Avatar Presets */}
            <View style={styles.presetRow}>
              {AVATAR_PRESETS.map((preset, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.presetItem, image === preset && styles.presetItemActive]}
                  onPress={() => setImage(preset)}
                >
                  <Image source={{ uri: preset }} style={styles.presetImage} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Username Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DISPLAY NAME</Text>
              <TextInput
                placeholder="Enter supporter handle"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={username}
                onChangeText={setUsername}
                style={styles.textInput}
              />
            </View>

            {/* Email Field (Read Only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ACCOUNT EMAIL</Text>
              <View style={styles.disabledInputBox}>
                <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
                <Text style={styles.disabledEmailText}>{user?.email}</Text>
              </View>
            </View>

            {/* Save Action */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#080a0f" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#080a0f" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelBtnText}>Discard</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
  },
  cameraPill: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#080a0f",
  },
  changePhotoText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  presetItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  presetItemActive: {
    borderColor: THEME.colors.primary,
  },
  presetImage: {
    width: "100%",
    height: "100%",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  disabledInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  disabledEmailText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#080a0f",
  },
  cancelBtn: {
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelBtnText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    fontWeight: "700",
  },
});
