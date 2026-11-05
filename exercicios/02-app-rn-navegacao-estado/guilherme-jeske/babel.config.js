module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) já injeta `react-native-worklets/plugin` automaticamente
    // quando react-native-worklets está instalado (Reanimated 4). Declarar o plugin de novo
    // aqui faria a transformação de worklets rodar duas vezes.
    presets: ['babel-preset-expo'],
    plugins: [
      // Path alias @/ → ./src/
      ['module-resolver', { root: ['./src'], alias: { '@': './src' } }],
    ],
  };
};
