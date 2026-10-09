import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { authService, messagingService, storageService } from "../services/carkila";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

export default function ChatScreen({ navigation, route }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const conversationId = Number(route?.params?.conversationId);
  const receiverId = String(route?.params?.receiverId || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [me, setMe] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(conversationId) || conversationId < 1 || !receiverId) {
      Alert.alert("Invalid chat", "This conversation link is incomplete.", [{ text: "Go back", onPress: () => navigation.goBack() }]);
      setLoading(false);
      return;
    }
    try {
      const [rows, user] = await Promise.all([messagingService.messages(conversationId), authService.user()]);
      setMessages(rows as any[]);
      setMe(user?.id || "");
      await messagingService.markRead(conversationId);
    } catch (caught) {
      Alert.alert("Unable to load chat", caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, navigation, receiverId]);

  useEffect(() => {
    void load();
    if (!Number.isInteger(conversationId) || conversationId < 1 || !receiverId) return;
    const channel = messagingService.subscribe(conversationId, (message) => {
      setMessages((current) => current.some((item) => item.id === (message as any).id) ? current : [...current, message]);
    });
    return () => { void channel.unsubscribe(); };
  }, [conversationId, load, receiverId]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    try {
      const message = await messagingService.send(conversationId, receiverId, value);
      setMessages((current) => current.some((item) => item.id === (message as any).id) ? current : [...current, message]);
    } catch (caught) {
      setText(value);
      Alert.alert("Message not sent", caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  const attach = async () => {
    if (sending) return;
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false, copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 20 * 1024 * 1024) return Alert.alert("Attachment too large", "Choose a file smaller than 20 MB.");
    setSending(true);
    let uploadedPath = "";
    try {
      const uploaded = await storageService.upload("message-attachments", asset.name, asset.uri, asset.mimeType || "application/octet-stream");
      uploadedPath = uploaded.path;
      const message = await messagingService.send(conversationId, receiverId, undefined, {
        attachment_path: uploaded.path,
        attachment_name: asset.name,
        attachment_mime: asset.mimeType || "application/octet-stream",
        attachment_size: uploaded.size,
      });
      setMessages((current) => current.some((item) => item.id === (message as any).id) ? current : [...current, message]);
    } catch (error) {
      if (uploadedPath) await storageService.remove("message-attachments", uploadedPath).catch(() => undefined);
      Alert.alert("Attachment not sent", error instanceof Error ? error.message : "Please try again.");
    } finally { setSending(false); }
  };

  const openAttachment = async (path: string) => {
    try {
      const url = await storageService.signedAttachmentUrl(path);
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("No app can open this attachment.");
      await Linking.openURL(url);
    } catch (error) { Alert.alert("Unable to open attachment", error instanceof Error ? error.message : "Please try again."); }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { height: s(62) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={[styles.back, { fontSize: s(24) }]}>‹</Text></TouchableOpacity>
        <TouchableOpacity style={{flex:1}} onPress={()=>navigation.navigate("RentalSummary",{conversationId})}><Text numberOfLines={1} style={[styles.name, { fontSize: s(18), marginLeft: s(14) }]}>{route?.params?.name || "Chat"}</Text></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={{ flex: 1 }} /> : (
        <FlatList data={messages} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ padding: s(16), gap: s(8) }}
          renderItem={({ item }) => {
            const mine = item.sender_id === me;
            return <View style={[styles.bubble, mine ? styles.mine : styles.theirs, { borderRadius: s(14), padding: s(11), maxWidth: "82%" }]}>
              {!!item.message && <Text style={{ fontFamily: fonts.regular, color: mine ? colors.white : colors.black, fontSize: s(14) }}>{item.message}</Text>}
              {!!item.attachment_path && <TouchableOpacity accessibilityLabel={`Open attachment ${item.attachment_name || "file"}`} onPress={() => openAttachment(item.attachment_path)} style={styles.attachment}><Text numberOfLines={2} style={[styles.attachmentText, { color: mine ? colors.white : colors.black }]}>📎 {item.attachment_name || "Attachment"}</Text>{!!item.attachment_size && <Text style={[styles.attachmentSize, { color: mine ? "rgba(255,255,255,.72)" : colors.grayText }]}>{Math.max(1, Math.round(Number(item.attachment_size) / 1024))} KB</Text>}</TouchableOpacity>}
              <Text style={{ fontFamily: fonts.regular, color: mine ? "rgba(255,255,255,0.7)" : colors.grayText, fontSize: s(9), marginTop: s(4) }}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
            </View>;
          }} />
      )}
      <View style={[styles.composer, { padding: s(10), paddingBottom: s(10) + insets.bottom }]}> 
        <TouchableOpacity accessibilityLabel="Attach file" onPress={attach} disabled={sending} style={[styles.attach, sending && { opacity: .45 }]}><Text style={styles.attachIcon}>＋</Text></TouchableOpacity>
        <TextInput value={text} onChangeText={setText} maxLength={4000} placeholder="Write a message" multiline style={[styles.input, { borderRadius: s(20), paddingHorizontal: s(14), paddingVertical: s(9), fontSize: s(14) }]} />
        <TouchableOpacity accessibilityLabel="Send message" onPress={send} disabled={sending || !text.trim()} style={[styles.send, { width: Math.max(44, s(42)), height: Math.max(44, s(42)), borderRadius: 22, marginLeft: s(8), opacity: !text.trim() ? 0.45 : 1 }]}> 
          {sending ? <ActivityIndicator color={colors.white} /> : <Text style={{ color: colors.white, fontSize: s(18) }}>➤</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  back: { color: colors.black }, name: { flex: 1, fontFamily: fonts.bold, color: colors.black },
  bubble: {}, mine: { alignSelf: "flex-end", backgroundColor: colors.primary }, theirs: { alignSelf: "flex-start", backgroundColor: "#EEEEEE" },
  attachment:{marginTop:4,paddingVertical:4},attachmentText:{fontFamily:fonts.semiBold,fontSize:13},attachmentSize:{fontFamily:fonts.regular,fontSize:10,marginTop:2},
  composer: { flexDirection: "row", alignItems: "flex-end", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  attach:{width:44,height:44,alignItems:"center",justifyContent:"center",marginRight:6},attachIcon:{fontSize:28,lineHeight:30,color:colors.primary},
  input: { flex: 1, maxHeight: 100, backgroundColor: "#F1F1F1", fontFamily: fonts.regular, color: colors.black },
  send: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
