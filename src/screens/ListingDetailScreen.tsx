import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService, interactionService, listingService, messagingService, reviewService } from "../services/carkila";
import { colors, fonts, images } from "../theme/colors";
import { useScale } from "../theme/scale";
import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";
import StarIcon from "../assets/icons/material-symbols_star.svg";

const image = (url?: string) => url ? { uri: url } : images.van;
const money = (value: unknown) => `PHP ${Number(value || 0).toLocaleString("en-PH")}`;
function Stars({ value, size }: { value: number; size: number }) { return <View style={styles.row}>{[1,2,3,4,5].map(n => <View key={n} style={{ opacity: n <= Math.round(value) ? 1 : .25 }}><StarIcon width={size} height={size} /></View>)}</View>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.muted}>{value}</Text></View>; }

export default function ListingDetailScreen({ navigation, route }: any) {
  const s = useScale(), insets = useSafeAreaInsets(), id = Number(route?.params?.listingId);
  const [listing, setListing] = useState<any>(null), [reviews, setReviews] = useState<any[]>([]);
  const [state, setState] = useState({ liked: false, favorited: false, following: false });
  const [mine, setMine] = useState(false), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) return setLoading(false);
    try {
      const row: any = await listingService.details(id); setListing(row);
      const v = row.vehicles;
      const [rs, interactions, user] = await Promise.all([reviewService.forVehicle(v.id), interactionService.state(row.id, v.id, v.vendor_id), authService.user().catch(() => null)]);
      setReviews(rs as any[]); setState(interactions); setMine(user?.id === v.vendor_id);
    } catch (e) { Alert.alert("Unable to load listing", e instanceof Error ? e.message : "Please try again."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  const act = async (task: () => Promise<unknown>, done: () => void) => { try { setBusy(true); await task(); done(); } catch(e) { Alert.alert("Action failed", e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); } };
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary}/></View>;
  if (!listing) return <View style={styles.center}><Text>Listing not found.</Text><TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.link}>Go back</Text></TouchableOpacity></View>;
  const v = listing.vehicles, vendor = v.profiles, photos = v.photos || [];
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;
  return <View style={[styles.root,{paddingTop:insets.top}]}>
    <View style={[styles.header,{height:s(58)}]}><TouchableOpacity onPress={() => navigation.goBack()}><BackIcon width={s(25)} height={s(25)}/></TouchableOpacity><Text numberOfLines={1} style={styles.headerTitle}>{v.title}</Text></View>
    <ScrollView contentContainerStyle={{paddingBottom:s(95)}}>
      <Image source={image(photos[0]?.webp_url || photos[0]?.url)} style={{width:"100%",height:s(280)}}/>
      <View style={{padding:s(20)}}><Text style={styles.title}>{v.title}</Text><Text style={styles.price}>{money(v.price_per_day)} / {v.price_unit}</Text>
        <Text style={styles.muted}>{Number(listing.listing_likes?.[0]?.count || 0)} likes · {listing.views_count || 0} views</Text>
        <Section title="Location"><Text style={styles.body}>{v.locations?.city || v.full_address || "Location unavailable"}{v.locations?.province ? `, ${v.locations.province}` : ""}</Text></Section>
        <Section title="Description"><Text style={styles.body}>{v.description}</Text></Section>
        <Section title="Details"><View style={styles.details}><Detail label="Fuel" value={v.fuel_included?"Included":"Not included"}/><Detail label="Parking fees" value={v.parking_fee_included?"Included":"Not included"}/><Detail label="Toll fees" value={v.toll_fee_included?"Included":"Not included"}/><Detail label="Self driving" value={v.self_driving_allowed?"Allowed":"Not allowed"}/><Detail label="Seats" value={String(v.seating_capacity || "N/A")}/></View></Section>
        <Section title="Operated by"><View style={styles.operator}><Image source={image(vendor?.profile_photo_path)} style={{width:s(45),height:s(45),borderRadius:s(23)}}/><Text numberOfLines={1} style={styles.operatorName}>{vendor?.display_name || vendor?.name || "Carkila operator"}</Text>{!mine&&<TouchableOpacity disabled={busy} style={styles.smallButton} onPress={()=>act(()=>state.following?interactionService.unfollow(v.vendor_id):interactionService.follow(v.vendor_id),()=>setState(x=>({...x,following:!x.following})))}><Text>{state.following?"Following":"Follow"}</Text></TouchableOpacity>}</View>{!mine&&<TouchableOpacity onPress={()=>navigation.navigate("ContactDetails",{profileId:v.vendor_id})}><Text style={styles.link}>Contact details</Text></TouchableOpacity>}</Section>
        <Section title={`Reviews (${reviews.length})`}><View style={styles.row}><Text style={styles.price}>{rating?rating.toFixed(1):"N/A"}</Text><Stars value={rating} size={s(18)}/></View>{reviews.slice(0,3).map(r=><View key={r.id} style={styles.review}><Text style={styles.detailLabel}>{r.customer?.display_name||r.customer?.name||"Customer"}</Text><Stars value={r.rating||0} size={s(15)}/><Text style={styles.body}>{r.comment||"No written review."}</Text></View>)}{!reviews.length&&<Text style={styles.muted}>No reviews yet.</Text>}</Section>
      </View>
    </ScrollView>
    <View style={[styles.actions,{paddingBottom:Math.max(insets.bottom,s(10))}]}>{mine?<><Button label="Edit listing" secondary onPress={()=>navigation.navigate("EditListing",{listingId:id})}/><Button label="View chats" onPress={()=>navigation.navigate("MainTabs",{screen:"Messages"})}/></>:<><Button label={state.favorited?"Saved":"Save"} secondary disabled={busy} onPress={()=>act(()=>state.favorited?interactionService.unfavorite(v.id):interactionService.favorite(v.id),()=>setState(x=>({...x,favorited:!x.favorited})))}/><Button label="Message" disabled={busy} onPress={()=>act(async()=>{const c:any=await messagingService.start(v.id,v.vendor_id);navigation.navigate("Chat",{conversationId:c.id,receiverId:v.vendor_id,name:vendor?.display_name||vendor?.name});},()=>{})}/></>}</View>
  </View>;
}
function Button({label,onPress,secondary,disabled}:{label:string,onPress:()=>void;secondary?:boolean;disabled?:boolean}) { return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.actionButton,secondary?styles.secondary:styles.primary]}><Text style={[styles.buttonText,secondary&&{color:colors.black}]}>{label}</Text></TouchableOpacity>; }
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.white},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12},link:{color:colors.primary,fontFamily:fonts.bold},header:{flexDirection:"row",alignItems:"center",paddingHorizontal:16,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},headerTitle:{flex:1,marginLeft:14,fontFamily:fonts.semiBold,fontSize:16},title:{fontFamily:fonts.semiBold,fontSize:20},price:{fontFamily:fonts.bold,fontSize:20,marginVertical:8},muted:{fontFamily:fonts.regular,fontSize:13,color:"rgba(0,0,0,.6)"},section:{marginTop:24,paddingTop:18,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:colors.border},sectionTitle:{fontFamily:fonts.bold,fontSize:17,marginBottom:12},body:{fontFamily:fonts.regular,fontSize:14,lineHeight:21},details:{flexDirection:"row",flexWrap:"wrap"},detail:{width:"50%",marginBottom:18},detailLabel:{fontFamily:fonts.semiBold,marginBottom:4},row:{flexDirection:"row",alignItems:"center",gap:8},operator:{flexDirection:"row",alignItems:"center"},operatorName:{flex:1,fontFamily:fonts.semiBold,marginHorizontal:10},smallButton:{borderWidth:1,borderRadius:6,paddingHorizontal:14,paddingVertical:7},review:{gap:6,marginTop:16},actions:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",gap:12,padding:12,backgroundColor:colors.white,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:colors.border},actionButton:{flex:1,minHeight:44,borderRadius:10,alignItems:"center",justifyContent:"center"},primary:{backgroundColor:colors.primary},secondary:{backgroundColor:colors.white,borderWidth:1},buttonText:{fontFamily:fonts.bold,color:colors.white}});
