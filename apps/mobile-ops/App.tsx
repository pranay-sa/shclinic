import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Sugar & Heart - Rider & Phlebotomist App</Text>
        <Text style={styles.subtitle}>Ready for delivery tasks, OTP verification, sample collection, and GPS workflows.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center"
  }
});
