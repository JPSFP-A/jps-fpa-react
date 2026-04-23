import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://bhrswnbenkvflpdjhfpa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocnN3bmJlbmt2ZmxwZGpoZnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTgwNDAsImV4cCI6MjA1OTE5NDA0MH0.pLCqSp-vNxhEjPb5yd_3hMDGRNBIPMIq3HS3o3PSSTU'
)
