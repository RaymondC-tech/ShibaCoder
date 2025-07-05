import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://vhqgvnutpayxomujglqe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocWd2bnV0cGF5eG9tdWpnbHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODIxODUsImV4cCI6MjA2NzI1ODE4NX0.xPk-iob8EhZd8Y6S7cGBuxPWe9nRPH0uYrgjsTFgwY4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your database
export interface User {
  id: string
  username: string
  elo: number
  created_at: string
}

export interface Lobby {
  id: string
  host_id: string
  guest_id: string | null
  is_private: boolean
  password: string | null
  status: string
  created_at: string
  host?: User
  guest?: User | null
}

// Simple database functions
export const dbFunctions = {
  // User functions
  async createUser(username: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, elo: 1000 }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Lobby functions
  async createLobby(hostId: string, isPrivate: boolean = false, password: string | null = null) {
    const { data, error } = await supabase
      .from('lobbies')
      .insert([{ 
        host_id: hostId, 
        is_private: isPrivate, 
        password,
        status: 'waiting' 
      }])
      .select(`
        *,
        host:users!lobbies_host_id_fkey(*),
        guest:users!lobbies_guest_id_fkey(*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async getLobbies() {
    const { data, error } = await supabase
      .from('lobbies')
      .select(`
        *,
        host:users!lobbies_host_id_fkey(*),
        guest:users!lobbies_guest_id_fkey(*)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async joinLobby(lobbyId: string, guestId: string, password: string | null = null) {
    // First check if lobby exists and validate password
    const { data: lobby, error: fetchError } = await supabase
      .from('lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single()
    
    if (fetchError) throw fetchError
    if (lobby.guest_id) throw new Error('Lobby is full')
    if (lobby.is_private && lobby.password !== password) throw new Error('Invalid password')
    
    // Join the lobby
    const { data, error } = await supabase
      .from('lobbies')
      .update({ guest_id: guestId })
      .eq('id', lobbyId)
      .select(`
        *,
        host:users!lobbies_host_id_fkey(*),
        guest:users!lobbies_guest_id_fkey(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }
} 