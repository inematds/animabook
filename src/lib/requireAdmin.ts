import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export type Role = 'user' | 'creator' | 'editor' | 'admin';

/** Hierarquia: admin > editor > creator > user */
const ROLE_LEVEL: Record<Role, number> = {
  user: 0,
  creator: 1,
  editor: 2,
  admin: 3,
};

interface AuthResult {
  userId: string;
  role: Role;
}

/**
 * Verifica se o request vem de um usuário com role >= minRole.
 * Retorna { userId, role } se OK, ou NextResponse de erro.
 */
export async function requireRole(
  request: NextRequest,
  minRole: Role = 'creator'
): Promise<AuthResult | NextResponse> {
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

  const role = (profile?.role as Role) || 'user';

  if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  return { userId: user.id, role };
}

/** Atalho para manter compatibilidade — exige pelo menos creator */
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, 'creator');
}

/** Helper para verificar se resultado é erro */
export function isErrorResponse(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
