import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { profileService, storageService } from "../services/carkila";
import { colors, fonts, images } from "../theme/colors";
import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [form, setForm] = useState({ display_name: "", based_location: "", bio: "", website: "", mobile_number: "", show_reviews: true, show_active_status: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const row: any = await profileService.mine();
      setProfile(row);
      setForm({
        display_name: row.display_name || row.name || "",
        based_location: row.based_location || "",
        bio: row.bio || "",
        website: row.website || "",
        mobile_number: row.mobile_number || "",
        show_reviews: row.show_reviews !== false,
        show_active_status: row.show_active_status !== false,
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load profile.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const set = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const pickAvatar = async () => {
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Photo access needed", "Allow photo access to choose a profile image.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled) setAvatar(result.assets[0]);
  };

  const save = async () => {
    const name = form.display_name.trim();
    if (name.length < 2 || name.length > 80) return Alert.alert("Check display name", "Use 2 to 80 characters.");
    if (form.bio.trim().length > 500) return Alert.alert("Bio is too long", "Use no more than 500 characters.");
    if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) return Alert.alert("Invalid website", "Website must start with http:// or https://.");
    setSaving(true);
    let uploadedAvatarPath = "";
    try {
      let profilePhotoPath = profile?.profile_photo_path || null;
      if (avatar) {
        const uploaded = await storageService.upload("avatars", avatar.fileName || "avatar.jpg", avatar.uri, avatar.mimeType || "image/jpeg");
        if (!uploaded.publicUrl) throw new Error("Uploaded avatar URL is unavailable.");
        uploadedAvatarPath = uploaded.path;
        profilePhotoPath = uploaded.publicUrl;
      }
      await profileService.updateMine({
        display_name: name,
        based_location: form.based_location.trim() || null,
        bio: form.bio.trim() || null,
        website: form.website.trim() || null,
        mobile_number: form.mobile_number.trim() || null,
        show_reviews: form.show_reviews,
        show_active_status: form.show_active_status,
        profile_photo_path: profilePhotoPath,
      });
      if (avatar && profile?.profile_photo_path) {
        const oldPath = storageService.publicObjectPath("avatars", profile.profile_photo_path);
        if (oldPath) await storageService.remove("avatars", oldPath).catch(() => undefined);
      }
      navigation.goBack();
    } catch (error) {
      if (uploadedAvatarPath) await storageService.remove("avatars", uploadedAvatarPath).catch(() => undefined);
      Alert.alert("Unable to save profile", error instanceof Error ? error.message : "Please try again.");
    } finally { setSaving(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (loadError) return <View style={styles.center}><Text style={styles.error}>{loadError}</Text><TouchableOpacity accessibilityRole="button" onPress={load} style={styles.retry}><Text style={styles.saveText}>Try again</Text></TouchableOpacity></View>;
  const avatarSource = avatar ? { uri: avatar.uri } : profile?.profile_photo_path ? { uri: profile.profile_photo_path } : images.logoDgb;
  return <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.headerButton}><BackIcon width={24} height={24}/></TouchableOpacity><Text style={styles.title}>Edit profile</Text></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}>
      <TouchableOpacity accessibilityLabel="Change profile photo" onPress={pickAvatar} style={styles.avatarWrap}><Image source={avatarSource} style={styles.avatar}/><Text style={styles.changePhoto}>Change photo</Text></TouchableOpacity>
      <Field label="Display name" value={form.display_name} onChangeText={(v: string) => set("display_name", v)} maxLength={80}/>
      <Field label="Based location" value={form.based_location} onChangeText={(v: string) => set("based_location", v)} maxLength={100}/>
      <Field label="Mobile number" value={form.mobile_number} onChangeText={(v: string) => set("mobile_number", v)} keyboardType="phone-pad" maxLength={30}/>
      <Field label="Website" value={form.website} onChangeText={(v: string) => set("website", v)} autoCapitalize="none" keyboardType="url" maxLength={200}/>
      <Field label="Business bio" value={form.bio} onChangeText={(v: string) => set("bio", v)} multiline maxLength={500}/>
      <Toggle label="Show reviews" value={form.show_reviews} onValueChange={(v) => set("show_reviews", v)}/>
      <Toggle label="Show active status" value={form.show_active_status} onValueChange={(v) => set("show_active_status", v)}/>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{disabled:saving}} disabled={saving} onPress={save} style={[styles.save, saving && styles.disabled]}>{saving ? <ActivityIndicator color={colors.white}/> : <Text style={styles.saveText}>Save changes</Text>}</TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, multiline, ...props }: any) { return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} placeholderTextColor="#9CA3AF" style={[styles.input, multiline && styles.multiline]}/></View>; }
function Toggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) { return <View style={styles.toggle}><Text style={styles.toggleLabel}>{label}</Text><Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#D1D5DB", true: "#F4A3A8" }} thumbColor={value ? colors.primary : "#FFFFFF"}/></View>; }

const styles = StyleSheet.create({ root:{flex:1,backgroundColor:colors.white},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:colors.white,padding:24,gap:18},error:{fontFamily:fonts.regular,color:colors.primary,textAlign:"center"},retry:{minWidth:150,height:46,borderRadius:23,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center"},header:{height:60,flexDirection:"row",alignItems:"center",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border,paddingHorizontal:12},headerButton:{width:44,height:44,alignItems:"center",justifyContent:"center"},title:{fontFamily:fonts.bold,fontSize:20,marginLeft:8},content:{padding:20},avatarWrap:{alignSelf:"center",alignItems:"center",marginBottom:14},avatar:{width:92,height:92,borderRadius:46,backgroundColor:colors.grayBg},changePhoto:{fontFamily:fonts.semiBold,color:colors.primary,marginTop:10},fieldWrap:{marginTop:16},label:{fontFamily:fonts.medium,fontSize:13,color:colors.textDark,marginBottom:8},input:{minHeight:50,borderWidth:1,borderColor:colors.border,borderRadius:9,paddingHorizontal:14,fontFamily:fonts.regular,fontSize:14,color:colors.textDark,backgroundColor:"#FAFAFA"},multiline:{height:120,paddingTop:13,textAlignVertical:"top"},toggle:{minHeight:54,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},toggleLabel:{fontFamily:fonts.medium,fontSize:14},save:{height:52,borderRadius:26,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",marginTop:28},disabled:{opacity:.6},saveText:{fontFamily:fonts.bold,color:colors.white,fontSize:15} });
