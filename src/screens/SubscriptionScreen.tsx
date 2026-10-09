import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

import CrossIcon from "../assets/icons/gridicons_cross.svg";
import CheckIcon from "../assets/icons/material-symbols_check.svg";
import ArrowForward from "../assets/icons/material-symbols_arrow-forward.svg";
import { creditService } from "../services/carkila";

interface Plan {
  id: number;
  name: string;
  price: number;
  credits: number;
}

function PlanCard({ plan }: { plan: Plan }) {
  const s = useScale();
  const btnColor = "#6B7280";
  return (
    <View>
      <View
        style={{
          width: "100%",
          minHeight: s(265),
          borderRadius: s(12),
          borderWidth: 1,
          borderColor: colors.black,
          backgroundColor: colors.white,
          alignSelf: "center",
        }}
      >
        <Text style={{ fontFamily: fonts.bold, fontSize: s(19), textAlign: "center", marginTop: s(14) }}>
          {plan.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", marginLeft: s(20), marginTop: s(12) }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: s(20) }}>₱{Number(plan.price).toLocaleString("en-PH")}</Text>
        </View>

        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(15),
            color: "rgba(0,0,0,0.7)",
            marginLeft: s(20),
            marginTop: s(16),
          }}
        >
          {plan.credits} LISTING {plan.credits === 1 ? "CREDIT" : "CREDITS"}
        </Text>

        <TouchableOpacity
          onPress={() => Alert.alert("Payments unavailable", "Secure checkout is not enabled yet. No payment or credit change was made.")}
          style={{
            marginHorizontal: s(20),
            marginTop: s(22),
            height: s(37),
            borderRadius: s(6),
            backgroundColor: btnColor,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: fonts.bold, fontSize: s(13), color: colors.white }}>CHECKOUT UNAVAILABLE</Text>
          <ArrowForward width={s(21)} height={s(21)} style={{ position: "absolute", right: s(9) }} />
        </TouchableOpacity>

        {[`${plan.credits} active ${plan.credits === 1 ? "listing" : "listings"} valid for 1 year.`, "Credits are applied only after verified payment."].map((perk) => (
          <View key={perk} style={{ flexDirection: "row", alignItems: "center", marginLeft: s(20), marginTop: s(10) }}>
            <CheckIcon width={s(24)} height={s(24)} />
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: s(14), lineHeight: s(19), marginLeft: s(12), marginRight: s(12) }}>{perk}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SubscriptionScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<Plan[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { creditService.packages().then((rows:any) => setPlans(rows)).catch((e:unknown) => setError(e instanceof Error ? e.message : "Unable to load plans.")).finally(()=>setLoading(false)); }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { height: s(64) }]}> 
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIcon}>
          <CrossIcon width={s(26)} height={s(26)} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold, fontSize: s(20), marginLeft: s(16) }}>
          Plans &amp; Pricing
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(40) }}>
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(14),
            color: colors.black,
            marginHorizontal: s(33),
            lineHeight: s(17),
          }}
        >
          Choose a listing-credit package. Secure checkout will be enabled after the payment provider is configured.
        </Text>

        <View style={{ marginTop: s(30), gap: s(14), paddingHorizontal: s(30) }}>
          {loading && <ActivityIndicator color={colors.primary}/>} {!!error && <Text style={{color:colors.primary,textAlign:"center"}}>{error}</Text>}
          {plans.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 21, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  headerIcon: { width: 36, height: 40, alignItems: "flex-start", justifyContent: "center" },
});
