import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { listingService, storageService } from "../services/carkila";
import { colors, fonts } from "../theme/colors";
import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";

type PhotoItem = { key: string; id?: number; url: string; originalUrl?: string; webpUrl?: string; asset?: ImagePicker.ImagePickerAsset };

export default function EditListingScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const listingId = Number(route?.params?.listingId);
  const [vehicleId, setVehicleId] = useState(0);
  const [status, setStatus] = useState("draft");
  const [form, setForm] = useState({ title:"",description:"",price:"",priceUnit:"day" as "day"|"km"|"hr",location:"",seatingCapacity:"",fuelIncluded:false,parkingIncluded:false,tollIncluded:false,selfDriving:false });
  const [options, setOptions] = useState<{subcategories:any[];types:any[]}>({subcategories:[],types:[]});
  const [subcategory, setSubcategory] = useState<any>(null);
  const [vehicleType, setVehicleType] = useState<any>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(listingId) || listingId < 1) { setLoading(false); return; }
    try {
      const [listing, choices]: any[] = await Promise.all([listingService.details(listingId), listingService.options()]);
      const v = listing.vehicles;
      setVehicleId(v.id); setStatus(listing.status); setOptions(choices);
      setForm({ title:v.title||"",description:v.description||"",price:String(v.price_per_day??""),priceUnit:v.price_unit||"day",location:v.full_address||v.locations?.city||"",seatingCapacity:v.seating_capacity?String(v.seating_capacity):"",fuelIncluded:!!v.fuel_included,parkingIncluded:!!v.parking_fee_included,tollIncluded:!!v.toll_fee_included,selfDriving:!!v.self_driving_allowed });
      setSubcategory(choices.subcategories.find((x:any)=>x.id===v.subcategory_id)||null);
      setVehicleType(choices.types.find((x:any)=>x.id===v.type_id)||null);
      setPhotos((v.photos||[]).filter((p:any)=>!p.deleted_at).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((p:any)=>({key:`db-${p.id}`,id:p.id,url:p.webp_url||p.url,originalUrl:p.url,webpUrl:p.webp_url})));
    } catch (error) { Alert.alert("Unable to load listing", error instanceof Error ? error.message : "Please try again."); }
    finally { setLoading(false); }
  }, [listingId]);
  useEffect(()=>{ void load(); },[load]);

  const set = (key:keyof typeof form,value:any)=>setForm(current=>({...current,[key]:value}));
  const cycle = (items:any[],current:any,setter:(value:any)=>void)=>{ if(!items.length)return; const index=items.findIndex(x=>x.id===current?.id);setter(items[(index+1)%items.length]); };
  const pickPhotos = async () => {
    if (photos.length >= 10) return Alert.alert("Photo limit reached", "A listing can have up to 10 photos.");
    if (Platform.OS !== "web") { const permission=await ImagePicker.requestMediaLibraryPermissionsAsync(); if(!permission.granted)return Alert.alert("Photo access needed","Allow photo access to add vehicle images."); }
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],allowsMultipleSelection:true,selectionLimit:10-photos.length,quality:.85});
    if(!result.canceled)setPhotos(current=>[...current,...result.assets.map((asset,index)=>({key:`new-${Date.now()}-${index}`,url:asset.uri,asset}))].slice(0,10));
  };
  const move=(index:number,direction:-1|1)=>setPhotos(current=>{const next=[...current],target=index+direction;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next;});
  const remove=(index:number)=>{
    const photo=photos[index];
    if(status==="active"&&photos.length===1)return Alert.alert("Photo required","An active listing must keep at least one vehicle photo.");
    const execute=async()=>{try{if(photo.id)await listingService.removePhoto({id:photo.id,url:photo.originalUrl||photo.url,webp_url:photo.webpUrl});setPhotos(current=>current.filter(item=>item.key!==photo.key));}catch(error){Alert.alert("Unable to remove photo",error instanceof Error?error.message:"Please try again.");}};
    if(photo.id)Alert.alert("Remove photo?","This removes the photo from the listing.",[{text:"Cancel",style:"cancel"},{text:"Remove",style:"destructive",onPress:()=>void execute()}]);else void execute();
  };
  const save=async()=>{
    const amount=Number(form.price.replace(/,/g,"")),seats=form.seatingCapacity?Number(form.seatingCapacity):null;
    if(form.title.trim().length<3||form.title.trim().length>120||form.description.trim().length<20||form.description.trim().length>5000||form.location.trim().length<2||!Number.isFinite(amount)||amount<0||amount>100000000||(seats!==null&&(!Number.isInteger(seats)||seats<1||seats>500)))return Alert.alert("Check listing details","Use a 3–120 character title, at least 20 description characters, a valid price/location, and seating from 1–500.");
    if(status==="active"&&!photos.length)return Alert.alert("Photo required","An active listing must keep at least one vehicle photo.");
    setSaving(true); const uploadedPaths:string[]=[];
    try{
      await listingService.updateDetails(vehicleId,{title:form.title,description:form.description,price:amount,priceUnit:form.priceUnit,location:form.location,seatingCapacity:seats,fuelIncluded:form.fuelIncluded,parkingFeeIncluded:form.parkingIncluded,tollFeeIncluded:form.tollIncluded,selfDrivingAllowed:form.selfDriving,subcategoryId:subcategory?.id??null,typeId:vehicleType?.id??null});
      const resolved: Array<{id:number;sort_order:number}> = [];
      for(let index=0;index<photos.length;index++){
        const photo=photos[index];
        if(photo.id){resolved.push({id:photo.id,sort_order:index});continue;}
        if(!photo.asset)continue;
        const uploaded=await storageService.upload("vehicle-photos",photo.asset.fileName||`listing-${index}.jpg`,photo.asset.uri,photo.asset.mimeType||"image/jpeg");
        if(!uploaded.publicUrl)throw new Error("Uploaded photo URL is unavailable."); uploadedPaths.push(uploaded.path);
        const row:any=await listingService.addPhoto(vehicleId,uploaded.publicUrl,index); resolved.push({id:row.id,sort_order:index});
      }
      await listingService.reorderPhotos(resolved);
      navigation.goBack();
    }catch(error){for(const path of uploadedPaths)await storageService.remove("vehicle-photos",path).catch(()=>undefined);Alert.alert("Unable to save listing",error instanceof Error?error.message:"Please try again.");}
    finally{setSaving(false);}
  };

  if(loading)return <View style={styles.center}><ActivityIndicator color={colors.primary}/></View>;
  if(!vehicleId)return <View style={styles.center}><Text style={styles.muted}>Listing not found.</Text><TouchableOpacity onPress={()=>navigation.goBack()}><Text style={styles.link}>Go back</Text></TouchableOpacity></View>;
  return <KeyboardAvoidingView style={[styles.root,{paddingTop:insets.top}]} behavior={Platform.OS==="ios"?"padding":undefined}>
    <View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={()=>navigation.goBack()} style={styles.headerButton}><BackIcon width={24} height={24}/></TouchableOpacity><Text style={styles.headerTitle}>Edit listing</Text></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content,{paddingBottom:34+insets.bottom}]}>
      <Text style={styles.sectionTitle}>Photos ({photos.length}/10)</Text><Text style={styles.help}>First photo is the cover. Use arrows to reorder.</Text>
      <View style={styles.photoGrid}>{photos.map((photo,index)=><View key={photo.key} style={styles.photoCard}><Image source={{uri:photo.url}} style={styles.photo}/>{index===0&&<Text style={styles.cover}>Cover</Text>}<View style={styles.photoActions}><Mini label="‹" disabled={index===0} onPress={()=>move(index,-1)}/><Mini label="Remove" danger onPress={()=>remove(index)}/><Mini label="›" disabled={index===photos.length-1} onPress={()=>move(index,1)}/></View></View>)}</View>
      {photos.length<10&&<TouchableOpacity onPress={pickPhotos} style={styles.addPhoto}><Text style={styles.addPhotoText}>+ Add photos</Text></TouchableOpacity>}
      <Field label="Title" value={form.title} onChangeText={(v:string)=>set("title",v)} maxLength={120}/>
      <Field label="Description" value={form.description} onChangeText={(v:string)=>set("description",v)} multiline maxLength={5000}/>
      <Field label="Price" value={form.price} onChangeText={(v:string)=>set("price",v)} keyboardType="decimal-pad"/>
      <Choice label="Price unit" value={form.priceUnit} onPress={()=>set("priceUnit",form.priceUnit==="day"?"km":form.priceUnit==="km"?"hr":"day")}/>
      <Choice label="Category" value={subcategory?`${subcategory.categories?.name||"Category"} · ${subcategory.name}`:"Not selected"} onPress={()=>cycle(options.subcategories,subcategory,setSubcategory)}/>
      <Choice label="Vehicle type" value={vehicleType?.name||"Not selected"} onPress={()=>cycle(options.types,vehicleType,setVehicleType)}/>
      <Field label="Location" value={form.location} onChangeText={(v:string)=>set("location",v)} maxLength={100}/>
      <Field label="Seating capacity" value={form.seatingCapacity} onChangeText={(v:string)=>set("seatingCapacity",v)} keyboardType="number-pad" maxLength={3}/>
      <Toggle label="Fuel included" value={form.fuelIncluded} onValueChange={(v)=>set("fuelIncluded",v)}/><Toggle label="Parking fees included" value={form.parkingIncluded} onValueChange={(v)=>set("parkingIncluded",v)}/><Toggle label="Toll fees included" value={form.tollIncluded} onValueChange={(v)=>set("tollIncluded",v)}/><Toggle label="Self driving allowed" value={form.selfDriving} onValueChange={(v)=>set("selfDriving",v)}/>
      <TouchableOpacity disabled={saving} onPress={save} style={[styles.save,saving&&{opacity:.6}]}>{saving?<ActivityIndicator color={colors.white}/>:<Text style={styles.saveText}>Save listing</Text>}</TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({label,multiline,...props}:any){return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} style={[styles.input,multiline&&styles.multiline]}/></View>;}
function Choice({label,value,onPress}:{label:string;value:string;onPress:()=>void}){return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TouchableOpacity onPress={onPress} style={styles.choice}><Text numberOfLines={1} style={styles.choiceText}>{value}</Text><Text>⌄</Text></TouchableOpacity></View>;}
function Toggle({label,value,onValueChange}:{label:string;value:boolean;onValueChange:(value:boolean)=>void}){return <View style={styles.toggle}><Text style={styles.label}>{label}</Text><Switch value={value} onValueChange={onValueChange}/></View>;}
function Mini({label,onPress,disabled,danger}:{label:string;onPress:()=>void;disabled?:boolean;danger?:boolean}){return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.mini,disabled&&{opacity:.3}]}><Text style={[styles.miniText,danger&&{color:colors.primary}]}>{label}</Text></TouchableOpacity>;}

const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.white},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:colors.white},header:{height:60,flexDirection:"row",alignItems:"center",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border,paddingHorizontal:12},headerButton:{width:44,height:44,alignItems:"center",justifyContent:"center"},headerTitle:{fontFamily:fonts.bold,fontSize:20,marginLeft:8},content:{padding:18},sectionTitle:{fontFamily:fonts.bold,fontSize:17},help:{fontFamily:fonts.regular,fontSize:12,color:colors.grayText,marginTop:4,marginBottom:12},photoGrid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},photoCard:{width:"48%",marginBottom:14,borderWidth:1,borderColor:colors.border,borderRadius:10,overflow:"hidden"},photo:{width:"100%",aspectRatio:1},cover:{position:"absolute",top:6,left:6,backgroundColor:colors.white,paddingHorizontal:8,paddingVertical:3,borderRadius:8,fontFamily:fonts.semiBold,fontSize:10},photoActions:{height:36,flexDirection:"row",alignItems:"center",justifyContent:"space-around"},mini:{paddingHorizontal:5,paddingVertical:8},miniText:{fontFamily:fonts.semiBold,fontSize:11},addPhoto:{height:46,borderWidth:1,borderStyle:"dashed",borderColor:colors.primary,borderRadius:9,alignItems:"center",justifyContent:"center"},addPhotoText:{fontFamily:fonts.bold,color:colors.primary},fieldWrap:{marginTop:17},label:{fontFamily:fonts.medium,fontSize:13,marginBottom:8,color:colors.textDark},input:{minHeight:50,borderWidth:1,borderColor:colors.border,borderRadius:9,paddingHorizontal:14,fontFamily:fonts.regular,fontSize:14,backgroundColor:"#FAFAFA"},multiline:{height:130,paddingTop:12,textAlignVertical:"top"},choice:{height:50,borderWidth:1,borderColor:colors.border,borderRadius:9,paddingHorizontal:14,flexDirection:"row",alignItems:"center",backgroundColor:"#FAFAFA"},choiceText:{flex:1,fontFamily:fonts.regular,fontSize:14},toggle:{minHeight:52,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border,paddingTop:10},save:{height:52,borderRadius:26,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",marginTop:28},saveText:{fontFamily:fonts.bold,color:colors.white},muted:{fontFamily:fonts.regular,color:colors.grayText},link:{fontFamily:fonts.bold,color:colors.primary}});
