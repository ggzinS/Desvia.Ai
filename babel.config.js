module.exports = {
  // O preset padrão do React Native
  presets: ['module:metro-react-native-babel-preset'],
  
  // A configuração do 'react-native-dotenv'
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env', // Este é o nome que usamos na importação
        path: '.env',        // Aponta para o arquivo .env na raiz
        allowUndefined: true, // Permite que o build não quebre se uma chave faltar
      },
    ],
  ],
};