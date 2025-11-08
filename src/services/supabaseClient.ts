// 1. Shims (polyfills) para compatibilidade do Supabase no React Native
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values/auto';

// 2. Importa o createClient
import { createClient } from '@supabase/supabase-js';

// 3. Importa as variáveis de ambiente (usando o '@env' que configuramos)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// 4. Inicialização do cliente (exatamente como você pediu)
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);