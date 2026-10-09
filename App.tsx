import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import HomeScreen from "./src/screens/HomeScreen";
import ListingDetailScreen from "./src/screens/ListingDetailScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import CreateListingScreen from "./src/screens/CreateListingScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SearchScreen from "./src/screens/SearchScreen";
import ManageListingsScreen from "./src/screens/ManageListingsScreen";
import {
  PublishModal,
  DeleteModal,
  RenewModal,
} from "./src/screens/Overlays";
import { AccountDrawer, CategoriesDrawer } from "./src/screens/Drawers";
import SubscriptionScreen from "./src/screens/SubscriptionScreen";
import ListingCreditsScreen from "./src/screens/ListingCreditsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ChatScreen from "./src/screens/ChatScreen";
import BottomNav, { TabName } from "./src/components/BottomNav";
import { colors } from "./src/theme/colors";
import { getSupabase, isSupabaseConfigured } from "./src/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import AppErrorBoundary from "./src/components/AppErrorBoundary";
import UpdatePasswordScreen from "./src/screens/UpdatePasswordScreen";
import EditListingScreen from "./src/screens/EditListingScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import { AboutScreen, CommunityFeedScreen, ContactDetailsScreen, NoCreditsScreen, RentalSummaryScreen, RenewalManagementScreen, SettingsScreen, WriteReviewScreen } from "./src/screens/AdditionalPages";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBar({ state, navigation }: BottomTabBarProps) {
  const active = state.routeNames[state.index] as TabName;
  const names: TabName[] = ["Home", "Notifications", "Create", "Messages", "Profile"];
  return (
    <BottomNav
      active={active}
      onChange={(t) => {
        const route = state.routes[names.indexOf(t)];
        if (route) navigation.navigate(route.name);
      }}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Create" component={CreateListingScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [recoveringPassword, setRecoveringPassword] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    getSupabase().auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (__DEV__ && error) console.error("Unable to restore session", error);
      setSession(data.session ?? null);
      setAuthReady(true);
    });
    const { data: listener } = getSupabase().auth.onAuthStateChange((event, nextSession) => {
      if (mounted) setSession(nextSession);
      if (mounted && event === "PASSWORD_RECOVERY") setRecoveringPassword(true);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!fontsLoaded || !authReady) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <AppErrorBoundary><SafeAreaProvider>
      <View style={styles.appBackground}>
        <View style={styles.phoneCanvas}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? recoveringPassword ? <Stack.Screen name="UpdatePassword">{()=><UpdatePasswordScreen onComplete={()=>setRecoveringPassword(false)}/>}</Stack.Screen> : <>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ManageListings" component={ManageListingsScreen} />
        <Stack.Screen name="EditListing" component={EditListingScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="PublishModal" component={PublishModal} options={{ presentation: "transparentModal", animation: "fade" }} />
        <Stack.Screen name="DeleteModal" component={DeleteModal} options={{ presentation: "transparentModal", animation: "fade" }} />
        <Stack.Screen name="RenewModal" component={RenewModal} options={{ presentation: "transparentModal", animation: "fade" }} />
        <Stack.Screen name="AccountDrawer" component={AccountDrawer} options={{ presentation: "transparentModal", animation: "slide_from_left" }} />
        <Stack.Screen name="CategoriesDrawer" component={CategoriesDrawer} options={{ presentation: "transparentModal", animation: "slide_from_left" }} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="ListingCredits" component={ListingCreditsScreen} />
        <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
        <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />
        <Stack.Screen name="RentalSummary" component={RentalSummaryScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="NoCredits" component={NoCreditsScreen} />
        <Stack.Screen name="RenewalManagement" component={RenewalManagementScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        </> : <>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        </>}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </SafeAreaProvider></AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  appBackground: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  phoneCanvas: {
    flex: 1,
    width: "100%",
    maxWidth: 412,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 0 32px rgba(17, 24, 39, 0.10)",
      } as any,
      default: {},
    }),
  },
});
