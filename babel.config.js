module.exports = function(api) {
  api.cache(true);
  return {
    // 1. Use o preset padrão do Expo. Ele já inclui o 'metro-react-native-babel-preset'
    presets: ['babel-preset-expo'],

    // 2. Adicione o plugin 'react-native-dotenv' (para o Supabase)
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          allowUndefined: true,
        },
      ],
    ],
  };
};