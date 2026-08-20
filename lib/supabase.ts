import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Cliente de servidor. Usa la service role key, que ignora las políticas RLS,
 * así que este módulo NUNCA debe importarse desde código que llegue al
 * navegador: solo desde rutas API, middleware y componentes de servidor.
 */
function faltaVariable(nombre: string): never {
  throw new Error(
    `Falta la variable de entorno ${nombre}. ` +
      'Defínela en .env.local para desarrollo y en Vercel > Settings > Environment Variables para producción.'
  )
}

if (!supabaseUrl) faltaVariable('SUPABASE_URL')
if (!supabaseServiceRoleKey) faltaVariable('SUPABASE_SERVICE_ROLE_KEY')

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
