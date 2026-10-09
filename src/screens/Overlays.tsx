import React, { useState } from "react";
import { Alert, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

import CrossIcon from "../assets/icons/gridicons_cross.svg";
import { listingService, profileService } from "../services/carkila";
import { useLiveCredits } from "../hooks/useLiveCredits";

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.center}>{children}</View>
    </View>
  );
}

export function ContactDetailsModal({ navigation }: any) {
  const s = useScale();
  const close = () => navigation?.goBack();
  return (
    <Backdrop onClose={close}>
      <View
        style={{
          width: s(374),
          borderRadius: s(13),
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.black,
          paddingBottom: s(40),
        }}
      >
        <Text
          style={{
            fontFamily: fonts.semiBold,
            fontSize: s(18),
            textAlign: "center",
            marginTop: s(24),
            color: colors.black,
          }}
        >
          Contact Details
        </Text>
        <TouchableOpacity onPress={close} style={{ position: "absolute", right: s(23), top: s(23) }}>
          <CrossIcon width={s(24)} height={s(24)} />
        </TouchableOpacity>

        <View style={{ paddingHorizontal: s(40), marginTop: s(37) }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: s(15) }}>Mobile</Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: s(15), color: "rgba(0,0,0,0.7)", marginTop: s(9) }}>
            +639477100123
          </Text>

          <Text style={{ fontFamily: fonts.bold, fontSize: s(15), marginTop: s(37) }}>Email</Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: s(15), color: "rgba(0,0,0,0.7)", marginTop: s(9) }}>
            easyexploreph@gmail.com
          </Text>

          <Text style={{ fontFamily: fonts.bold, fontSize: s(15), marginTop: s(37) }}>Website</Text>
          <Text
            style={{ fontFamily: fonts.regular, fontSize: s(15), color: "#1877F2", marginTop: s(8) }}
            onPress={() => Linking.openURL("https://www.easyexplore.ph/")}
          >
            https://www.easyexplore.ph/
          </Text>
        </View>
      </View>
    </Backdrop>
  );
}

export function PublishModal({ navigation, route }: any) {
  const s = useScale();
  const close = () => navigation?.goBack();
  const [busy, setBusy] = useState(false);
  const { credits, creditsError, refreshCredits } = useLiveCredits();
  const publish = async () => {
    const listingId = route?.params?.listingId;
    if (!listingId) return navigation?.navigate("MainTabs");
    if (!credits) return navigation?.replace("NoCredits");
    setBusy(true);
    try {
      await listingService.publish(Number(listingId));
      await refreshCredits();
      navigation?.navigate("ManageListings");
    } catch (caught) {
      Alert.alert("Unable to publish", caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Backdrop onClose={close}>
      <View
        style={{
          width: s(374),
          borderRadius: s(13),
          backgroundColor: colors.white,
          paddingBottom: s(40),
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(18),
            color: "rgba(0,0,0,0.8)",
            textAlign: "center",
            marginTop: s(25),
          }}
        >
          Publish Listing
        </Text>
        <TouchableOpacity onPress={close} style={{ position: "absolute", right: s(22), top: s(24) }}>
          <CrossIcon width={s(24)} height={s(24)} />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(15),
            textAlign: "center",
            color: colors.black,
            marginTop: s(36),
          }}
        >
          Available
        </Text>
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(21),
            textAlign: "center",
            color: "rgba(0,0,0,0.8)",
            marginTop: s(10),
          }}
        >
          {credits === null ? "Loading credits..." : `${credits} Listing Credit${credits === 1 ? "" : "s"}`}
        </Text>
        {!!creditsError && <Text style={{ fontFamily: fonts.regular, fontSize: s(12), color: colors.primary, textAlign: "center", marginTop: s(8) }}>Unable to refresh credits</Text>}

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: s(23), marginTop: s(42) }}>
          <TouchableOpacity
            onPress={() => navigation?.navigate("Subscription")}
            style={{
              width: s(152),
              height: s(40),
              borderRadius: s(7),
              borderWidth: 1,
              borderColor: colors.black,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: "#2F2F2F" }}>Add Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: s(152),
              height: s(40),
              borderRadius: s(7),
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={credits ? publish : () => navigation?.replace("NoCredits")}
            disabled={busy}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: colors.white }}>Publish now</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(12),
            color: colors.black,
            textAlign: "center",
            marginHorizontal: s(30),
            marginTop: s(8),
            lineHeight: s(15),
          }}
        >
          By publishing, you agree to our Terms and Conditions and Privacy Policy.
        </Text>
      </View>
    </Backdrop>
  );
}

function ConfirmCard({
  title,
  subtitle,
  leftLabel,
  rightLabel,
  onLeft,
  onRight,
  onClose,
}: {
  title: string;
  subtitle: string;
  leftLabel: string;
  rightLabel: string;
  onLeft?: () => void;
  onRight?: () => void;
  onClose: () => void;
}) {
  const s = useScale();
  return (
    <Backdrop onClose={onClose}>
      <View
        style={{
          width: s(343),
          borderRadius: s(11),
          backgroundColor: colors.white,
          paddingBottom: s(28),
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(16),
            textAlign: "center",
            marginTop: s(34),
            color: colors.black,
          }}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onClose} style={{ position: "absolute", right: s(19), top: s(22) }}>
          <CrossIcon width={s(24)} height={s(24)} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(15),
            textAlign: "center",
            color: "rgba(0,0,0,0.7)",
            marginTop: s(14),
          }}
        >
          {subtitle}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: s(36), marginTop: s(27) }}>
          <TouchableOpacity
            onPress={onLeft ?? onClose}
            style={{
              width: s(125),
              height: s(44),
              borderRadius: s(9),
              borderWidth: 1,
              borderColor: colors.black,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: "#212121" }}>{leftLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRight}
            style={{
              width: s(125),
              height: s(44),
              borderRadius: s(9),
              backgroundColor: colors.navActive,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: colors.white }}>{rightLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Backdrop>
  );
}

export function DeleteModal({ navigation, route }: any) {
  const remove = async () => {
    try {
      await listingService.remove(Number(route?.params?.listingId));
      navigation?.navigate("ManageListings");
    } catch (caught) {
      Alert.alert("Unable to delete", caught instanceof Error ? caught.message : "Please try again.");
    }
  };
  return (
    <ConfirmCard
      title="Delete this listing?"
      subtitle="You cannot undo this action"
      leftLabel="Go Back"
      rightLabel="Yes, Delete"
      onRight={remove}
      onClose={() => navigation?.goBack()}
    />
  );
}

export function RenewModal({ navigation, route }: any) {
  const renew = async () => {
    try {
      await listingService.renew(Number(route?.params?.listingId));
      navigation?.navigate("ManageListings");
    } catch (caught) {
      Alert.alert("Unable to renew", caught instanceof Error ? caught.message : "Please try again.");
    }
  };
  return (
    <ConfirmCard
      title="Mark as Active?"
      subtitle="One listing credit will be used."
      leftLabel="Add More"
      rightLabel="Confirm"
      onLeft={() => navigation?.navigate("Subscription")}
      onRight={renew}
      onClose={() => navigation?.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  center: {
    alignSelf: "center",
  },
});
