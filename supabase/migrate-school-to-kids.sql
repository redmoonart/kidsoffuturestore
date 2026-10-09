-- ============================================================
-- Kids of the Future — استبدال "الأدوات المدرسية" بـ"منتجات الأطفال"
-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor.
--
-- ⚠️ يحذف نهائياً كل المنتجات والأصناف التابعة لفئة "school".
--    الطلبات القديمة لا تتأثر (تحفظ أسماء المنتجات وأسعارها داخلها).
-- ============================================================

begin;

-- 1) حذف المنتجات والأصناف المدرسية
delete from public.products where category = 'school';
delete from public.subcategories where category = 'school';

-- 2) الفئات المسموحة الآن: ألعاب + منتجات الأطفال
alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check check (category in ('toys', 'kids'));

alter table public.subcategories drop constraint if exists subcategories_category_check;
alter table public.subcategories add constraint subcategories_category_check check (category in ('toys', 'kids'));

-- 3) أصناف منتجات الأطفال (تقدر تبدّلها أو تحذفها من لوحة الإدارة)
insert into public.subcategories (slug, category, emoji, label_ar, label_fr, label_en, sort_order)
values
  ('baby-care', 'kids', '🧴', 'العناية بالطفل', 'Soins bébé', 'Baby care', 5),
  ('feeding', 'kids', '🍼', 'الرضاعة والتغذية', 'Repas et biberons', 'Feeding', 6),
  ('kids-clothes', 'kids', '👕', 'ملابس الأطفال', 'Vêtements enfants', 'Kids clothing', 7),
  ('kids-accessories', 'kids', '🎀', 'إكسسوارات الأطفال', 'Accessoires enfants', 'Kids accessories', 8)
on conflict (slug) do nothing;

commit;
