module.exports = {
  preset: "jest-expo",
  setupFiles: [
    "<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|@react-native-google-signin/.*|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@expo-google-fonts/.*|@react-navigation/.*|nativewind|react-native-css|lucide-react-native|react-native-svg|standard-navigation)/)",
  ],
};
