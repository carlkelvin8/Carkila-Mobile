import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/carkila";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

export default function RegisterScreen({ navigation }: any) {
  const s = useScale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (!name.trim() || !email.trim() || !password) return setError("Complete all required fields.");
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return setError("Use at least 12 characters with uppercase, lowercase, and a number.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      const response = await authService.signUp(email, password, name.trim());
      if (!response.session) {
        Alert.alert("Verify your email", "Open the confirmation link we sent, then log in.");
        navigation.replace("Login");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, value: string, setter: (value: string) => void, secure = false) => (
    <View style={{ marginTop: s(18) }}>
      <Text style={[styles.label, { fontSize: s(13), marginBottom: s(8) }]}>{label}</Text>
      <TextInput value={value} onChangeText={setter} secureTextEntry={secure}
        autoCapitalize={label === "Email" ? "none" : undefined}
        keyboardType={label === "Email" ? "email-address" : "default"}
        style={[styles.input, { height: s(52), borderRadius: s(8), paddingHorizontal: s(15), fontSize: s(14) }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: s(30), paddingBottom: s(40) }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: s(18) }}>
            <Text style={[styles.back, { fontSize: s(14) }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { fontSize: s(25), marginTop: s(42) }]}>Create operator account</Text>
          <Text style={[styles.subtitle, { fontSize: s(13), marginTop: s(8) }]}>Manage listings, inquiries, and credits in one place.</Text>
          {field("Name", name, setName)}
          {field("Email", email, setEmail)}
          {field("Password", password, setPassword, true)}
          {field("Confirm password", confirmPassword, setConfirmPassword, true)}
          {!!error && <Text style={[styles.error, { fontSize: s(12), marginTop: s(14) }]}>{error}</Text>}
          <TouchableOpacity onPress={register} disabled={loading}
            style={[styles.button, { height: s(52), borderRadius: s(26), marginTop: s(28) }]}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.buttonText, { fontSize: s(15) }]}>Create account</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.white },
  back: { color: colors.primary, fontFamily: fonts.semiBold },
  title: { color: colors.textDark, fontFamily: fonts.bold },
  subtitle: { color: colors.grayText, fontFamily: fonts.regular },
  label: { color: colors.textDark, fontFamily: fonts.medium },
  input: { borderWidth: 1, borderColor: "#DCDCDC", backgroundColor: "#FAFAFA", color: colors.textDark, fontFamily: fonts.regular },
  error: { color: "#B42318", fontFamily: fonts.regular },
  button: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  buttonText: { color: colors.white, fontFamily: fonts.semiBold },
});
