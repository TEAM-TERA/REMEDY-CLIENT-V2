module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 56) automatically adds the react-native-worklets
    // babel plugin required by react-native-reanimated v4, so we do not add it
    // manually here (doing so would register it twice).
    presets: ['babel-preset-expo'],
  };
};
