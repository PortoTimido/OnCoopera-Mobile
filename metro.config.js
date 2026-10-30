const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
const nativewindConfig = withNativewind(config);
const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const isExpoAssetImportingReactNative =
    moduleName === "react-native" &&
    context.originModulePath.includes(`${path.sep}node_modules${path.sep}expo-asset${path.sep}`);

  if (isExpoAssetImportingReactNative) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return nativewindResolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
