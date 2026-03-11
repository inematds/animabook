import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole, isErrorResponse, Role } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/users — lista usuários com roles (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isErrorResponse(auth)) return auth;

  const supabase = getAdminClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, username, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(users ?? []);
}

// PATCH /api/admin/users — atualiza role de um usuário (admin only)
export async function PATCH(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: 'userId e role são obrigatórios' }, { status: 400 });
  }

  const validRoles: Role[] = ['user', 'creator', 'editor', 'admin'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `role deve ser: ${validRoles.join(', ')}` }, { status: 400 });
  }

  // Não pode remover admin de si mesmo
  if (userId === auth.userId && role !== 'admin') {
    return NextResponse.json({ error: 'Você não pode rebaixar a si mesmo' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, username, role')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
