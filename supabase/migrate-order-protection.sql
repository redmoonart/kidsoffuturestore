-- ============================================================
-- Kids of the Future — حماية الطلبيات (الدفع عند الاستلام)
-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor.
--
-- 1) حالة جديدة للطلب: "refused" = رُفض عند الاستلام
-- 2) جدول الأرقام المحظورة (المدير وحده يقرأ ويكتب)
-- لا يحذف أي بيانات.
-- ============================================================

begin;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'confirmed', 'shipped', 'delivered', 'refused', 'cancelled'));

create table if not exists public.blocked_phones (
  phone text primary key check (phone ~ '^[0-9]{8,15}$'),
  reason text check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);

alter table public.blocked_phones enable row level security;

drop policy if exists "Admins can read blocked phones" on public.blocked_phones;
create policy "Admins can read blocked phones" on public.blocked_phones
  for select to authenticated using ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

drop policy if exists "Admins can block phones" on public.blocked_phones;
create policy "Admins can block phones" on public.blocked_phones
  for insert to authenticated with check ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

drop policy if exists "Admins can unblock phones" on public.blocked_phones;
create policy "Admins can unblock phones" on public.blocked_phones
  for delete to authenticated using ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

commit;
