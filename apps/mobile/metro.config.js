const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const mobileModules = path.resolve(__dirname, "node_modules");
const rootModules = path.resolve(__dirname, "../../node_modules");

// Ensure the mobile app's node_modules (React 18) takes priority
// over the monorepo root (React 19) for all resolution.
config.resolver = config.resolver || {};

config.resolver.nodeModulesPaths = [mobileModules, rootModules];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, replace victory-native with a no-op shim to avoid
  // the @shopify/react-native-skia native dependency.
  if (platform === "web" && moduleName === "victory-native") {
    return {
      filePath: path.resolve(__dirname, "lib/victory-native-web-shim.js"),
      type: "sourceFile",
    };
  }

  // Force react and react-dom to always resolve from the mobile app's
  // node_modules, even when required by packages in root node_modules.
  if (
    moduleName === "react" ||
    moduleName.startsWith("react/") ||
    moduleName === "react-dom" ||
    moduleName.startsWith("react-dom/")
  ) {
    try {
      return {
        filePath: require.resolve(moduleName, { paths: [mobileModules] }),
        type: "sourceFile",
      };
    } catch {
      // Fall through to default resolution
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
