import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fonts } from "../theme/colors";

type State = { error: Error | null };

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) console.error("Uncaught application error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <View style={styles.root} accessibilityRole="alert">
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>The app encountered an unexpected error. Your account data was not changed.</Text>
      <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.white },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.textDark },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center", color: colors.grayText, marginTop: 10 },
  button: { marginTop: 22, borderRadius: 22, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: colors.white, fontFamily: fonts.semiBold },
});
