import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";
import { listingService } from "../services/carkila";
import { storageService } from "../services/carkila";
import * as ImagePicker from "expo-image-picker";

import CloseIcon from "../assets/icons/material-symbols_close.svg";
import MapPinIcon from "../assets/icons/ph_map-pin.svg";

function ChevronDown({ size }: { size: number }) {
  return (
    <View style={{ width: size * 2.1, alignItems: "center" }}>
      <Text style={{ fontSize: size * 1.6, lineHeight: size * 1.9, color: colors.black, marginTop: -size * 0.4 }}>
        ⌄
      </Text>
    </View>
  );
}

function PlusBadge({ size }: { size: number }) {
  const s = useScale();
  return (
    <View
      style={{
        position: "absolute",
        alignSelf: "center",
        top: "38%",
      }}
    >
      <Text style={{ fontSize: s(51), color: "rgba(0,0,0,0.3)", fontWeight: "300", textAlign: "center" }}>+</Text>
    </View>
  );
}

export default function CreateListingScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState("day");
  const [desc, setDesc] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [fuelIncluded, setFuelIncluded] = useState(false);
  const [parkingIncluded, setParkingIncluded] = useState(false);
  const [tollIncluded, setTollIncluded] = useState(false);
  const [selfDriving, setSelfDriving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [options, setOptions] = useState<{ subcategories: any[]; types: any[] }>({ subcategories: [], types: [] });
  const [subcategory, setSubcategory] = useState<any>(null);
  const [vehicleType, setVehicleType] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [picker, setPicker] = useState<{ title: string; items: any[]; selectedId?: number; label: (item: any) => string; onSelect: (item: any) => void } | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setOptionsLoading(true);
      setOptionsError("");
      const loaded = await listingService.options();
      setOptions(loaded);
      if (!loaded.subcategories.length || !loaded.types.length) setOptionsError("Listing options are not configured yet.");
    } catch (caught) {
      setOptionsError(caught instanceof Error ? caught.message : "Could not load listing options.");
    } finally { setOptionsLoading(false); }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const openPicker = (title: string, items: any[], current: any, setter: (value: any) => void, label: (item: any) => string) => {
    if (optionsLoading) return;
    if (!items.length) { void loadOptions(); return; }
    setPicker({ title, items, selectedId: current?.id, label, onSelect: setter });
  };

  const pickPhotos = async () => {
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Photo access needed", "Allow photo access to add listing images.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: 10 - photos.length, quality: 0.85 });
    if (!result.canceled) setPhotos(current => [...current, ...result.assets].slice(0, 10));
  };

  const submit = async (status: "draft" | "active") => {
    const amount = Number(price.replace(/,/g, ""));
    const seats = seatingCapacity ? Number(seatingCapacity) : null;
    if (status === "active" && photos.length === 0) {
      Alert.alert("Add a vehicle photo", "At least one photo is required before publishing. You can still save the listing as a draft.");
      return;
    }
    if (title.trim().length < 3 || title.trim().length > 120 || desc.trim().length < 20 || desc.trim().length > 5000 || location.trim().length < 2 || location.trim().length > 100 || !Number.isFinite(amount) || amount < 0 || amount > 100000000 || (seats !== null && (!Number.isInteger(seats) || seats < 1 || seats > 500))) {
      Alert.alert("Check listing details", "Use a 3–120 character title, at least 20 description characters, a valid price/location, and seating from 1–500.");
      return;
    }
    setSubmitting(true);
    let created: any = null;
    try {
      created = await listingService.create({
        title: title.trim(), description: desc.trim(), price: amount,
        priceUnit: unit as "day" | "km" | "hr", location: location.trim(), status: "draft",
        seatingCapacity: seats,
        fuelIncluded, parkingFeeIncluded: parkingIncluded, tollFeeIncluded: tollIncluded,
        selfDrivingAllowed: selfDriving,
        subcategoryId: subcategory?.id ?? null,
        typeId: vehicleType?.id ?? null,
      });
      for (const [index, photo] of photos.entries()) {
        const uploaded = await storageService.upload("vehicle-photos", photo.fileName || `listing-${index}.jpg`, photo.uri, photo.mimeType || "image/jpeg");
        if (!uploaded.publicUrl) throw new Error("The uploaded photo URL is unavailable.");
        await listingService.addPhoto(created.vehicle_id, uploaded.publicUrl, index);
      }
      if (status === "active") {
        await listingService.publish(created.id);
        Alert.alert("Listing published", "Your listing is now active.");
        navigation?.navigate("ManageListings");
      }
      else {
        Alert.alert("Draft saved", "Your listing was saved as a draft.");
        navigation?.navigate("ManageListings");
      }
    } catch (caught) {
      Alert.alert(created ? "Draft saved, but setup is incomplete" : "Unable to save listing", `${caught instanceof Error ? caught.message : "Please try again."}${created ? " You can retry from Manage Listings." : ""}`);
    } finally {
      setSubmitting(false);
    }
  };

  const dropdownRow = (
    placeholder: string,
    marginTop: number,
    value?: string,
    onPick?: () => void,
    fullWidth = true,
  ) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPick}
      style={[
        styles.field,
        {
          height: s(40),
          borderRadius: s(7),
          marginHorizontal: fullWidth ? s(21) : 0,
          marginTop: s(marginTop),
          flexDirection: "row",
          alignItems: "center",
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.regular,
          fontSize: s(15),
          color: value ? colors.black : "rgba(0,0,0,0.6)",
          marginLeft: s(17),
          flex: 1,
        }}
      >
        {value ?? placeholder}
      </Text>
      <ChevronDown size={s(10)} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={insets.top}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <CloseIcon width={s(28)} height={s(28)} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold, fontSize: s(20), color: "#212121", marginLeft: s(20) }}>
          Add Details
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(110) }}>
        {/* Photo grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: s(9), paddingHorizontal: s(18), marginTop: s(13) }}>
          {photos.map((photo, i) => (
            <View key={i} style={{ width: "48.5%", aspectRatio: 1, borderRadius: s(6.4), overflow: "hidden" }}>
              <Image source={{ uri: photo.uri }} style={{ width: "100%", height: "100%" }} />
              {i === 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: s(5),
                    left: s(5),
                    backgroundColor: colors.white,
                    borderRadius: s(7.7),
                    height: s(15.4),
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: s(8),
                  }}
                >
                  <Text style={{ fontFamily: fonts.regular, fontSize: s(10.3), color: colors.black }}>
                    Cover Photo
                  </Text>
                </View>
              )}
            </View>
          ))}
          {/* Empty slot */}
          {photos.length < 10 && <TouchableOpacity onPress={pickPhotos}
            style={{
              width: "48.5%",
              aspectRatio: 1,
              borderRadius: s(6.4),
              borderWidth: 1,
              borderColor: colors.black,
              backgroundColor: colors.white,
            }}
          >
            <PlusBadge size={s(51)} />
          </TouchableOpacity>}
        </View>
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(13),
            color: colors.black,
            marginLeft: s(24),
            marginTop: s(10),
          }}
        >
          Choose up to 10 photos. Drag to reorder
        </Text>

        {dropdownRow(optionsLoading ? "Loading categories..." : "Select Category", 21, subcategory ? `${subcategory.categories?.name || "Category"} · ${subcategory.name}` : undefined, () => openPicker("Select Category", options.subcategories, subcategory, setSubcategory, item => `${item.categories?.name || "Category"} · ${item.name}`))}
        {dropdownRow(optionsLoading ? "Loading vehicle types..." : "Vehicle Type", 19, vehicleType?.name, () => openPicker("Vehicle Type", options.types, vehicleType, setVehicleType, item => item.name))}
        {!!optionsError && <TouchableOpacity accessibilityRole="button" onPress={loadOptions} style={{marginHorizontal:s(22),marginTop:s(10),paddingVertical:s(8)}}><Text style={{fontFamily:fonts.regular,fontSize:s(12),color:colors.primary,textAlign:"center"}}>{optionsError}{"\n"}Tap to retry</Text></TouchableOpacity>}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Listing Title"
          placeholderTextColor="rgba(0,0,0,0.6)"
          style={[styles.field, { height: s(40), borderRadius: s(7), marginHorizontal: s(21), marginTop: s(18), paddingHorizontal: s(17), fontFamily: fonts.regular, fontSize: s(15) }]}
        />

        {/* Price row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: s(21), marginTop: s(18) }}>
          <View
            style={[
              styles.field,
              { height: s(40), borderRadius: s(7), flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center" },
            ]}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: "rgba(0,0,0,0.6)", marginLeft: s(16) }}>
              PHP
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Listing Price"
              placeholderTextColor="rgba(0,0,0,0.6)"
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: fonts.regular,
                fontSize: s(15),
                color: colors.black,
                marginLeft: s(12),
                padding: 0,
              }}
            />
          </View>
          <Text style={{ fontFamily: fonts.semiBold, fontSize: s(20), color: "rgba(0,0,0,0.6)", marginLeft: s(7), marginRight: s(7) }}>
            /
          </Text>
          {["day", "km", "hr"].map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => setUnit(u)}
              style={{
                width: s(46),
                height: s(40),
                borderRadius: s(7),
                borderWidth: 1,
                borderColor: colors.black,
                backgroundColor: unit === u ? "#424242" : colors.white,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: s(-1),
              }}
            >
              <Text style={{ fontFamily: fonts.regular, fontSize: s(15), color: unit === u ? colors.white : "rgba(0,0,0,0.6)" }}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <View
          style={[
            styles.field,
            {
              height: s(191),
              borderRadius: s(7),
              marginHorizontal: s(22),
              marginTop: s(38),
              paddingVertical: s(11),
              paddingHorizontal: s(5),
            },
          ]}
        >
          <TextInput
            multiline
            maxLength={800}
            value={desc}
            onChangeText={setDesc}
            placeholder="Description"
            placeholderTextColor="rgba(0,0,0,0.8)"
            style={{
              flex: 1,
              fontFamily: fonts.regular,
              fontSize: s(13),
              color: colors.black,
              textAlignVertical: "top",
              padding: 0,
            }}
          />
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: s(11),
              color: colors.black,
              alignSelf: "flex-end",
              marginRight: s(9),
            }}
          >
            {desc.length}/800
          </Text>
        </View>

        {/* Location */}
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(13),
            color: colors.black,
            marginLeft: s(26),
            marginTop: s(37),
          }}
        >
          Set your location to be visible to nearby renters.
        </Text>
        <View
          style={[
            styles.field,
            {
              height: s(40),
              borderRadius: s(7),
              marginHorizontal: s(22),
              marginTop: s(6),
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          <MapPinIcon width={s(18)} height={s(18)} style={{ marginLeft: s(8), opacity: 0.5 }} />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Garage or nearby area"
            placeholderTextColor="rgba(0,0,0,0.6)"
            style={{
              flex: 1,
              fontFamily: fonts.regular,
              fontSize: s(15),
              color: colors.black,
              marginLeft: s(4),
              padding: 0,
            }}
          />
        </View>

        {/* Detail selects */}
        {(
          [
            ["Fuel", "Included", "Parking Fees", "Not Included"],
            ["Toll Fees", "Not Included", "Seating Capacity", "49"],
          ] as const
        ).map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", marginHorizontal: s(21), marginTop: s(ri === 0 ? 33 : 27) }}>
            <View style={{ width: s(178) }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: s(14), color: "rgba(0,0,0,0.6)" }}>{row[0]}</Text>
              {dropdownRow(row[1], 4, ri === 0 ? (fuelIncluded ? "Included" : "Not Included") : (tollIncluded ? "Included" : "Not Included"), () => ri === 0 ? setFuelIncluded((v) => !v) : setTollIncluded((v) => !v), false)}
            </View>
            <View style={{ flex: 1, marginLeft: s(13) }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: s(14), color: "rgba(0,0,0,0.6)" }}>{row[2]}</Text>
              {ri === 1 ? (
                <TextInput value={seatingCapacity} onChangeText={setSeatingCapacity} keyboardType="number-pad"
                  placeholder="49" placeholderTextColor="rgba(0,0,0,0.6)"
                  style={[styles.field, { height: s(40), borderRadius: s(7), marginTop: s(4), paddingHorizontal: s(12), fontFamily: fonts.regular, fontSize: s(15) }]} />
              ) : dropdownRow(row[3], 4, parkingIncluded ? "Included" : "Not Included", () => setParkingIncluded((v) => !v), false)}
            </View>
          </View>
        ))}
        <View style={{ flexDirection: "row", marginHorizontal: s(21), marginTop: s(27) }}>
          <View style={{ width: s(178) }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: s(14), color: "rgba(0,0,0,0.6)" }}>Self Driving</Text>
            {dropdownRow("Not Allowed", 4, selfDriving ? "Allowed" : "Not Allowed", () => setSelfDriving((v) => !v), false)}
          </View>
          <View style={{ flex: 1, marginLeft: s(13) }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          height: s(61 + (insets.bottom ? insets.bottom : 12)),
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: s(22),
          paddingTop: s(8),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(0,0,0,0.15)",
          paddingBottom: insets.bottom,
        }}
      >
        <TouchableOpacity
          onPress={() => submit("draft")}
          disabled={submitting}
          style={{
            flex: 1,
            height: s(40),
            borderRadius: s(7),
            borderWidth: 1,
            borderColor: colors.black,
            backgroundColor: colors.white,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: "rgba(0,0,0,0.8)" }}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            height: s(40),
            borderRadius: s(7),
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: s(15),
          }}
          onPress={() => submit("active")}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: colors.white }}>List Now</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity accessibilityLabel="Close options" style={StyleSheet.absoluteFill} onPress={() => setPicker(null)} />
          <View style={[styles.pickerCard,{borderRadius:s(14),maxHeight:s(500)}]}>
            <View style={[styles.pickerHeader,{padding:s(18)}]}><Text style={[styles.pickerTitle,{fontSize:s(18)}]}>{picker?.title}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close options" onPress={()=>setPicker(null)}><CloseIcon width={s(24)} height={s(24)}/></TouchableOpacity></View>
            <ScrollView contentContainerStyle={{paddingBottom:s(12)}}>
              {picker?.items.map(item=><TouchableOpacity accessibilityRole="button" key={item.id} onPress={()=>{picker.onSelect(item);setPicker(null)}} style={[styles.pickerOption,{minHeight:s(52),paddingHorizontal:s(18)},picker.selectedId===item.id&&styles.pickerSelected]}><Text style={[styles.pickerOptionText,{fontSize:s(14)},picker.selectedId===item.id&&{color:colors.primary}]}>{picker.label(item)}</Text>{picker.selectedId===item.id&&<Text style={{color:colors.primary,fontSize:s(18)}}>✓</Text>}</TouchableOpacity>)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    height: 64,
    backgroundColor: colors.white,
  },
  field: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  modalBackdrop:{flex:1,backgroundColor:"rgba(0,0,0,.45)",alignItems:"center",justifyContent:"center",padding:20},
  pickerCard:{width:"100%",maxWidth:440,backgroundColor:colors.white,overflow:"hidden"},
  pickerHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},
  pickerTitle:{fontFamily:fonts.bold,color:colors.textDark},
  pickerOption:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},
  pickerSelected:{backgroundColor:"#FFF3F4"},
  pickerOptionText:{fontFamily:fonts.regular,color:colors.textDark,flex:1},
});
