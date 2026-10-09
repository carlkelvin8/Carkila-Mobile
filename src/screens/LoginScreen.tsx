import React, { useState } from "react";
import {
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fonts, images } from "../theme/colors";
import { useScale } from "../theme/scale";
import EyeIcon from "../assets/icons/iconamoon_eye-thin.svg";
import { authService } from "../services/carkila";

export default function LoginScreen({ navigation }: any) {
  const s = useScale();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    if (!identifier.trim() || !password) {
      setError("Enter your email/mobile number and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.signIn(identifier, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!identifier.includes("@")) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(identifier);
      Alert.alert("Check your email", "We sent you a password reset link.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: s(30) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.brand, { marginTop: s(58) }]}>
            <Image
              source={images.logoDgb}
              style={{ width: s(82), height: s(82), borderRadius: s(41) }}
            />
            <Text style={[styles.brandName, { fontSize: s(24), marginTop: s(17) }]}>Carkila</Text>
            <Text style={[styles.operatorLabel, { fontSize: s(13), marginTop: s(5) }]}>OPERATORS</Text>
          </View>

          <View style={{ marginTop: s(52) }}>
            <Text style={[styles.title, { fontSize: s(25) }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { fontSize: s(13), marginTop: s(8) }]}>Sign in to manage your vehicle listings</Text>

            <Text style={[styles.label, { fontSize: s(13), marginTop: s(31), marginBottom: s(9) }]}>Email or mobile number</Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter your email or mobile number"
              placeholderTextColor="#A1A1A1"
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { height: s(52), borderRadius: s(8), paddingHorizontal: s(15), fontSize: s(14) }]}
            />

            <Text style={[styles.label, { fontSize: s(13), marginTop: s(19), marginBottom: s(9) }]}>Password</Text>
            <View style={[styles.passwordField, { height: s(52), borderRadius: s(8) }]}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A1A1A1"
                secureTextEntry={!showPassword}
                style={[styles.passwordInput, { paddingHorizontal: s(15), fontSize: s(14) }]}
                onSubmitEditing={signIn}
              />
              <TouchableOpacity
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                onPress={() => setShowPassword((value) => !value)}
                style={{ padding: s(14) }}
              >
                <EyeIcon width={s(21)} height={s(21)} />
              </TouchableOpacity>
            </View>

            <View style={[styles.optionsRow, { marginTop: s(16) }]}>
              <Pressable style={styles.rememberRow} onPress={() => setRemember((value) => !value)}>
                <View style={[styles.checkbox, { width: s(19), height: s(19), borderRadius: s(4) }, remember && styles.checkboxActive]}>
                  {remember && <Text style={[styles.checkmark, { fontSize: s(13) }]}>✓</Text>}
                </View>
                <Text style={[styles.optionText, { fontSize: s(12), marginLeft: s(8) }]}>Remember me</Text>
              </Pressable>
              <TouchableOpacity onPress={resetPassword} disabled={loading}>
                <Text style={[styles.forgot, { fontSize: s(12) }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {!!error && <Text style={[styles.error, { fontSize: s(12), marginTop: s(12) }]}>{error}</Text>}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={signIn}
              disabled={loading}
              style={[styles.loginButton, { height: s(52), borderRadius: s(26), marginTop: s(34) }]}
            >
              {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.loginText, { fontSize: s(15) }]}>Log in</Text>}
            </TouchableOpacity>

            <View style={[styles.signUpRow, { marginTop: s(24), marginBottom: s(36) }]}>
              <Text style={[styles.signUpPrompt, { fontSize: s(13) }]}>New operator? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
                <Text style={[styles.signUpLink, { fontSize: s(13) }]}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, width: "100%", maxWidth: 412, alignSelf: "center" },
  brand: { alignItems: "center" },
  brandName: { fontFamily: fonts.bold, color: colors.textDark, letterSpacing: -0.4 },
  operatorLabel: { fontFamily: fonts.semiBold, color: colors.primary, letterSpacing: 2.4 },
  title: { fontFamily: fonts.bold, color: colors.textDark, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.regular, color: colors.grayText },
  label: { fontFamily: fonts.medium, color: colors.textDark },
  input: { borderWidth: 1, borderColor: "#DCDCDC", color: colors.textDark, fontFamily: fonts.regular, backgroundColor: "#FAFAFA" },
  passwordField: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DCDCDC", backgroundColor: "#FAFAFA", overflow: "hidden" },
  passwordInput: { flex: 1, height: "100%", color: colors.textDark, fontFamily: fonts.regular, outlineStyle: "none" } as any,
  optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { borderWidth: 1, borderColor: "#C6C6C6", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontFamily: fonts.bold, lineHeight: 15 },
  optionText: { color: colors.grayText, fontFamily: fonts.regular },
  forgot: { color: colors.primary, fontFamily: fonts.semiBold },
  error: { color: "#B42318", fontFamily: fonts.regular },
  loginButton: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...Platform.select({ web: { boxShadow: "0 4px 9px rgba(222,45,54,0.20)" } as any, default: { shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 3 } }) },
  loginText: { color: colors.white, fontFamily: fonts.semiBold },
  signUpRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signUpPrompt: { color: colors.grayText, fontFamily: fonts.regular },
  signUpLink: { color: colors.primary, fontFamily: fonts.semiBold },
});
