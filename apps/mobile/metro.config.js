const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// On web, replace victory-native with a no-op shim to avoid
// the @shopify/react-native-skia native dependency.
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "victory-native") {
    return {
      filePath: path.resolve(__dirname, "lib/victory-native-web-shim.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
