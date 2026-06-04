export default {
  expo: {
    name: "KOAS",
    slug: "koas",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo/koas_official_icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/logo/koas_official_icon.png",
      resizeMode: "contain",
      backgroundColor: "#0a0f0d"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.koas.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo/koas_official_icon.png",
        backgroundColor: "#0a0f0d"  
      },
      package: "com.koas.app",
      navigationBar: {
        backgroundColor: "#f9fafb"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Production API URL - used only in standalone builds (APK/IPA)
      // In development (Expo Go), this will be ignored and local IP auto-detected
      apiUrl: "https://koas-production.up.railway.app",
      eas: {
        projectId: "33957a49-59c5-49ae-a629-342fb905dad1"
      }
    }
  }
};
