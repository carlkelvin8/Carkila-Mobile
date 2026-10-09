import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Text, TouchableOpacity, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { creditService, profileService } from "../services/carkila";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";
import CrossIcon from "../assets/icons/gridicons_cross.svg";
import { useLiveCredits } from "../hooks/useLiveCredits";

export default function ListingCreditsScreen({ navigation }: any) {
  const s = useScale(), insets = useSafeAreaInsets();
  const { credits: balance, creditsError } = useLiveCredits();
  const [rows, setRows] = useState<any[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); setRows(await creditService.history()); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load credits."); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <View style={[styles.root,{paddingTop:insets.top}]}>
    <View style={[styles.header,{height:s(64)}]}><TouchableOpacity onPress={()=>navigation.goBack()}><CrossIcon width={s(25)} height={s(25)}/></TouchableOpacity><Text style={[styles.title,{fontSize:s(20)}]}>Listing Credits</Text></View>
    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.primary}/></View> : <ScrollView contentContainerStyle={{padding:s(19),paddingBottom:s(40)}}>
      <View style={[styles.balance,{padding:s(20),borderRadius:s(10)}]}><Text style={styles.muted}>Available listing credits</Text><Text style={[styles.amount,{fontSize:s(28)}]}>{balance ?? "—"}</Text><TouchableOpacity style={styles.add} onPress={()=>navigation.navigate("Subscription")}><Text style={styles.addText}>Add more</Text></TouchableOpacity></View>
      {!!(error || creditsError) && <TouchableOpacity onPress={load}><Text style={styles.error}>{error || creditsError}{"\n"}Tap to retry</Text></TouchableOpacity>}
      <Text style={[styles.historyTitle,{marginTop:s(34)}]}>Credit history</Text>
      {!error && rows.length===0 && <Text style={styles.empty}>No credit transactions yet.</Text>}
      {rows.map(row=><View key={row.id} style={styles.row}><View style={{flex:1}}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.muted}>{new Date(row.occurred_at).toLocaleDateString("en-PH")}</Text></View><Text style={[styles.delta,{color:Number(row.delta)>=0?"#157347":colors.primary}]}>{Number(row.delta)>=0?"+":""}{row.delta}</Text></View>)}
    </ScrollView>}
  </View>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.white},loading:{flex:1,alignItems:"center",justifyContent:"center"},header:{flexDirection:"row",alignItems:"center",paddingHorizontal:19,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},title:{fontFamily:fonts.bold,marginLeft:16},balance:{borderWidth:1,borderColor:colors.border},muted:{fontFamily:fonts.regular,fontSize:13,color:colors.grayText},amount:{fontFamily:fonts.bold,marginTop:7},add:{position:"absolute",right:18,top:30,backgroundColor:colors.primary,borderRadius:18,paddingHorizontal:17,paddingVertical:9},addText:{fontFamily:fonts.bold,color:colors.white,fontSize:12},historyTitle:{fontFamily:fonts.bold,fontSize:16},row:{flexDirection:"row",alignItems:"center",paddingVertical:16,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},rowTitle:{fontFamily:fonts.semiBold,fontSize:14,marginBottom:4},delta:{fontFamily:fonts.bold,fontSize:17},empty:{fontFamily:fonts.regular,color:colors.grayText,textAlign:"center",marginTop:36},error:{fontFamily:fonts.regular,color:colors.primary,textAlign:"center",marginTop:24}});
