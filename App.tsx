import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    Bangers: require("./assets/fonts/Bangers.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <HomeScreen />
    </>
  );
}
