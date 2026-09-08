import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseDisponible } from '../lib/supabase'
import type { Cita, Estado, Evento, Lead, Seguimiento } from '../lib/types'

export const ETAPAS = ['nuevo', 'contactar', 'contactado', 'calificado', 'separado', 'descartado'] as const
export type Etapa = (typeof ETAPAS)[number]

export const ETAPA_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  contactar: 'Por contactar',
  contactado: 'Contactado',
  calificado: 'Calificado',
  separado: 'Separado',
  descartado: 'Descartado',
}

export const ETAPA_COLOR: Record<string, string> = {
  nuevo: 'bg-sky-100 text-sky-700',
  contactar: 'bg-amber-100 text-amber-700',
  contactado: 'bg-indigo-100 text-indigo-700',
  calificado: 'bg-emerald-100 text-emerald-700',
  separado: 'bg-violet-100 text-violet-700',
  descartado: 'bg-slate-200 text-slate-500',
}

function ordenarPorScore(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => b.score - a.score)
}

/** Leads ordenados por score desc, con Realtime en INSERT/UPDATE. */
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(true)
  const [nuevoId, setNuevoId] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const { data, error } = await supabase.from('leads').select('*').order('score', { ascending: false })
      if (error) console.warn('[leads]', error.message)
      if (activo) {
        setLeads(ordenarPorScore((data as Lead[]) ?? []))
        setCargando(false)
      }
    }
    void cargar()

    if (!supabaseDisponible) return () => { activo = false }

    const canal = supabase
      .channel('panel-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const row = payload.new as Lead
        setLeads(prev => ordenarPorScore([row, ...prev.filter(l => l.id !== row.id)]))
        setNuevoId(row.id)
        setTimeout(() => setNuevoId(actual => (actual === row.id ? null : actual)), 2000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        const row = payload.new as Lead
        setLeads(prev => ordenarPorScore(prev.map(l => (l.id === row.id ? row : l))))
      })
      .subscribe()

    return () => {
      activo = false
      void supabase.removeChannel(canal)
    }
  }, [])

  return { leads, cargando, nuevoId }
}

/** Un lead + sus eventos (por lead_id o por la sesión que lo originó), con Realtime. */
export function useLead(id: string | undefined) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id) return
    let activo = true
    setCargando(true)
    setLead(null)
    supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.warn('[lead]', error.message)
        if (activo) {
          setLead((data as Lead) ?? null)
          setCargando(false)
        }
      })

    if (!supabaseDisponible) return () => { activo = false }

    const canal = supabase
      .channel(`panel-lead-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads', filter: `id=eq.${id}` },
        (payload) => setLead(payload.new as Lead),
      )
      .subscribe()

    return () => {
      activo = false
      void supabase.removeChannel(canal)
    }
  }, [id])

  const sesionId = lead?.sesion_id ?? null

  useEffect(() => {
    if (!id) return
    let activo = true

    async function cargarEventos() {
      const filtro = sesionId ? `lead_id.eq.${id},sesion_id.eq.${sesionId}` : `lead_id.eq.${id}`
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .or(filtro)
        .order('created_at', { ascending: false })
      if (error) console.warn('[eventos]', error.message)
      if (activo) setEventos((data as Evento[]) ?? [])
    }
    void cargarEventos()

    if (!supabaseDisponible) return () => { activo = false }

    function upsert(row: Evento) {
      setEventos(prev => {
        const sinRow = prev.filter(e => e.id !== row.id)
        return [row, ...sinRow].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      })
    }

    const canales = [
      supabase
        .channel(`panel-eventos-lead-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'eventos', filter: `lead_id=eq.${id}` },
          (payload) => upsert(payload.new as Evento),
        )
        .subscribe(),
    ]
    if (sesionId) {
      canales.push(
        supabase
          .channel(`panel-eventos-sesion-${sesionId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'eventos', filter: `sesion_id=eq.${sesionId}` },
            (payload) => upsert(payload.new as Evento),
          )
          .subscribe(),
      )
    }

    return () => {
      activo = false
      canales.forEach(c => void supabase.removeChannel(c))
    }
  }, [id, sesionId])

  return { lead, eventos, cargando }
}

function useTablaConRealtime<T>(tabla: string, orderBy: string, ascending: boolean) {
  const [filas, setFilas] = useState<T[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const { data, error } = await supabase.from(tabla).select('*').order(orderBy, { ascending })
      if (error) console.warn(`[${tabla}]`, error.message)
      if (activo) {
        setFilas((data as T[]) ?? [])
        setCargando(false)
      }
    }
    void cargar()

    if (!supabaseDisponible) return () => { activo = false }

    const canal = supabase
      .channel(`panel-${tabla}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => void cargar())
      .subscribe()

    return () => {
      activo = false
      void supabase.removeChannel(canal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabla])

  return { filas, cargando }
}

export function useCitas() {
  const { filas, cargando } = useTablaConRealtime<Cita>('citas', 'fecha', true)
  return { citas: filas, cargando }
}

export function useSeguimientos() {
  const { filas, cargando } = useTablaConRealtime<Seguimiento>('seguimientos', 'programado_para', true)
  return { seguimientos: filas, cargando }
}

export interface Kpis {
  visitantes: number
  leads: number
  conversion: number
  calificados: number
  separaciones: number
}

const KPIS_VACIOS: Kpis = { visitantes: 0, leads: 0, conversion: 0, calificados: 0, separaciones: 0 }

/** KPIs agregados; se refrescan con Realtime (leads/unidades) y un ping cada 30s (sesiones no tiene Realtime). */
export function useKpis() {
  const [kpis, setKpis] = useState<Kpis>(KPIS_VACIOS)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    async function cargar() {
      const [sesiones, leads, calificados, separaciones] = await Promise.all([
        supabase.from('sesiones').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('score', 70),
        supabase.from('unidades').select('*', { count: 'exact', head: true }).eq('estado', 'separado'),
      ])
      for (const r of [sesiones, leads, calificados, separaciones]) {
        if (r.error) console.warn('[kpis]', r.error.message)
      }
      if (!activo) return
      const nVisitantes = sesiones.count ?? 0
      const nLeads = leads.count ?? 0
      setKpis({
        visitantes: nVisitantes,
        leads: nLeads,
        conversion: nVisitantes > 0 ? Math.round((nLeads / nVisitantes) * 1000) / 10 : 0,
        calificados: calificados.count ?? 0,
        separaciones: separaciones.count ?? 0,
      })
      setCargando(false)
    }
    void cargar()

    if (!supabaseDisponible) return () => { activo = false }

    const canal = supabase
      .channel('panel-kpis')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => void cargar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'unidades' }, () => void cargar())
      .subscribe()
    const intervalo = setInterval(() => void cargar(), 30000)

    return () => {
      activo = false
      clearInterval(intervalo)
      void supabase.removeChannel(canal)
    }
  }, [])

  return { kpis, cargando }
}

/** Índice lead_id -> lead, útil en Citas/Seguimientos para mostrar nombre y teléfono. */
export function useLeadsPorId() {
  const { leads } = useLeads()
  return useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads])
}

export async function actualizarEtapa(id: string, etapa: string) {
  const { error } = await supabase.from('leads').update({ etapa }).eq('id', id)
  if (error) console.warn('[actualizarEtapa]', error.message)
}

export async function actualizarEstadoUnidad(id: string, estado: Estado) {
  const { error } = await supabase.from('unidades').update({ estado }).eq('id', id)
  if (error) console.warn('[actualizarEstadoUnidad]', error.message)
}

export async function marcarSeguimientoEnviado(id: string) {
  const { error } = await supabase.from('seguimientos').update({ estado: 'enviado' }).eq('id', id)
  if (error) console.warn('[marcarSeguimientoEnviado]', error.message)
}

export async function actualizarCita(id: string, estado: string) {
  const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
  if (error) console.warn('[actualizarCita]', error.message)
}
