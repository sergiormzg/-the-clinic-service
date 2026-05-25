import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvoofazzuddyhargednk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aA8YZxvjloP66gIevUpfUg_i92xdWSg'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export async function generarFolio(){const{data,error}=await supabase.rpc('generar_folio');if(error)throw error;return data}
export async function buscarClientePorTelefono(telefono){const{data,error}=await supabase.from('clientes').select('*').eq('telefono',telefono).maybeSingle();if(error)throw error;return data}
export async function crearCliente(input){const{data,error}=await supabase.from('clientes').insert(input).select('*').single();if(error)throw error;return data}
export async function buscarOCrearCliente(input){const existente=await buscarClientePorTelefono(input.telefono);if(existente)return existente;return crearCliente(input)}
export async function crearEquipo(input){const{data,error}=await supabase.from('equipos').insert(input).select('*').single();if(error)throw error;return data}
export async function crearRecepcion(input){const{data,error}=await supabase.from('recepciones').insert(input).select('*').single();if(error)throw error;return data}
export async function actualizarCliente(id,input){const{data,error}=await supabase.from('clientes').update(input).eq('id',id).select('*').single();if(error)throw error;return data}
export async function actualizarEquipo(id,input){const{data,error}=await supabase.from('equipos').update(input).eq('id',id).select('*').single();if(error)throw error;return data}
export async function actualizarRecepcion(id,input){const{data,error}=await supabase.from('recepciones').update(input).eq('id',id).select('*').single();if(error)throw error;return data}
export async function listarRecepciones(){const{data,error}=await supabase.from('v_recepciones_completas').select('*').order('fecha_recepcion',{ascending:false}).limit(100);if(error)throw error;return (data||[]).filter(r=>String(r.observaciones||'')!=='ELIMINADO_SOFT_DELETE'&&String(r.estado||'')!=='Eliminado')}
export async function eliminarRecepcion(id){const{data,error}=await supabase.from('recepciones').update({estado:'Cancelado',observaciones:'ELIMINADO_SOFT_DELETE'}).eq('id',id).select('*').single();if(error)throw error;return data}

export async function subirFotoRecepcion(path,file){const{data,error}=await supabase.storage.from('recepcion-fotos').upload(path,file,{upsert:true});if(error)throw error;return data}
export async function subirFirmaRecepcion(path,blob){const{data,error}=await supabase.storage.from('recepcion-firmas').upload(path,blob,{contentType:'image/png',upsert:true});if(error)throw error;return data}

export function publicStorageUrl(bucket, path) {
  if (!path) return ''
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function registrarFotoRecepcion(input) {
  const payload = {
    ...input,
    url_publica: input.url_publica || publicStorageUrl('recepcion-fotos', input.storage_path)
  }

  const { data, error } = await supabase
    .from('recepcion_fotos')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function registrarFirmaRecepcion(input) {
  const payload = {
    ...input,
    url_publica: input.url_publica || publicStorageUrl('recepcion-firmas', input.storage_path)
  }

  const { data, error } = await supabase
    .from('recepcion_firmas')
    .upsert(payload, { onConflict: 'recepcion_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function listarFotosRecepcion(recepcionId) {
  const { data, error } = await supabase
    .from('recepcion_fotos')
    .select('*')
    .eq('recepcion_id', recepcionId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map((f) => ({
    ...f,
    publicUrl: f.url_publica || publicStorageUrl('recepcion-fotos', f.storage_path)
  }))
}

export async function listarFirmaRecepcion(recepcionId) {
  const { data, error } = await supabase
    .from('recepcion_firmas')
    .select('*')
    .eq('recepcion_id', recepcionId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    publicUrl: data.url_publica || publicStorageUrl('recepcion-firmas', data.storage_path)
  }
}
