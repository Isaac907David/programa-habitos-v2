// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// ¡Aquí estaba el error! Ya le agregué la "j" correcta
const supabaseUrl = 'https://yztxudmvkjyarbzeyhzv.supabase.co'
const supabaseKey = 'sb_publishable_9hMvhqWYlILdqUrWJDeZZQ_-e6I0hIY'

export const supabase = createClient(supabaseUrl, supabaseKey)