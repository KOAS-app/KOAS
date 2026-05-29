export default {
  expo: {
    name: "KOAS",
    slug: "koas",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0D4A1F"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.koas.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0D4A1F"
      },
      package: "com.koas.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Set this to your deployed backend URL for production/EAS builds
      // Leave undefined for local Expo Go development (auto-detects LAN IP)
      // Example: apiUrl: "https://your-backend.up.railway.app"
      apiUrl: process.env.API_URL || undefined,
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};
