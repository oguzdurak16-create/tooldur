import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

const disabledResult = {
  data: null,
  error: {
    message:
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable database features.',
  },
  count: 0,
}

function createDisabledQuery(): any {
  const query = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: any, reject: any) => Promise.resolve(disabledResult).then(resolve, reject)
      }
      if (prop === 'catch') {
        return (reject: any) => Promise.resolve(disabledResult).catch(reject)
      }
      if (prop === 'finally') {
        return (callback: any) => Promise.resolve(disabledResult).finally(callback)
      }
      return () => createDisabledQuery()
    },
    apply() {
      return createDisabledQuery()
    },
  })

  return query
}

function createDisabledSupabase(): any {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: async () => 'ok',
  }

  return {
    from: () => createDisabledQuery(),
    rpc: () => createDisabledQuery(),
    channel: () => channel,
    removeChannel: async () => 'ok',
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => disabledResult,
      signUp: async () => disabledResult,
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => disabledResult,
      signInWithOAuth: async () => disabledResult,
      exchangeCodeForSession: async () => disabledResult,
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
    },
    storage: {
      from: () => createDisabledQuery(),
    },
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'tooldur-auth',
      },
    })
  : createDisabledSupabase()
