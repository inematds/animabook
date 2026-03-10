import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface AdminAuth {
  userId: string;
}

/**
 * Verifica se o request vem de um admin autenticado.
 * Retorna { userId } se OK, ou NextResponse de erro.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AdminAuth | NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  return { userId: user.id };
}

/** Helper para verificar se resultado é erro */
export function isErrorResponse(result: AdminAuth | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
