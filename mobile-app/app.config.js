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
      apiUrl: process.env.API_URL || 'https://api.arifsource.com',
      eas: {
        // projectId: "4733e811-9948-4c96-951b-e89696d450cd",
        projectId: "4c8812c4-3804-4ca5-813b-3f5ac82f1d99",
        owner: "hamzah01"
      }
    }
  }
};
