-- ============================================================
-- Kids of the Future — Supabase setup (run once in the Supabase
-- SQL Editor: https://app.supabase.com/project/_/sql/new)
-- Creates the products table, enables Row Level Security so
-- everyone can read products but only a signed-in admin can
-- write, seeds it with the current 24-product catalog, and sets
-- up a public "product-images" storage bucket for the admin
-- dashboard's image upload.
-- ============================================================

create table if not exists public.products (
  id bigint primary key,
  category text not null check (category in ('toys', 'kids')),
  sub_category text,
  emoji text,
  image text,
  name text not null,
  name_fr text,
  name_en text,
  description text,
  description_fr text,
  description_en text,
  price integer not null,
  old_price integer,
  badge text,
  age_group text,
  stock boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists stock_qty integer check (stock_qty >= 0);

alter table public.products enable row level security;

drop policy if exists "Public read access" on public.products;
create policy "Public read access" on public.products
  for select using (true);

drop policy if exists "Admins can insert" on public.products;
create policy "Admins can insert" on public.products
  for insert to authenticated with check (true);

drop policy if exists "Admins can update" on public.products;
create policy "Admins can update" on public.products
  for update to authenticated using (true) with check (true);

drop policy if exists "Admins can delete" on public.products;
create policy "Admins can delete" on public.products
  for delete to authenticated using (true);

-- Seed: the current 24-product catalog (safe to re-run, skips existing ids)
insert into public.products
  (id, category, sub_category, emoji, image, name, name_fr, name_en, description, description_fr, description_en, price, old_price, badge, age_group, stock)
values
  (101, 'toys', 'vehicles', '🚗', NULL, 'سيارة تحكم عن بعد', 'Voiture télécommandée', 'Remote control car', 'سيارة سباق بجهاز تحكم لاسلكي، بطارية قابلة للشحن، سرعة عالية وتصميم متين يناسب اللعب الداخلي والخارجي.', 'Voiture de course avec télécommande sans fil, batterie rechargeable, grande vitesse et design robuste pour jouer à l''intérieur comme à l''extérieur.', 'Racing car with wireless remote, rechargeable battery, high speed and a sturdy design for indoor and outdoor play.', 3200, 4000, 'الأكثر مبيعاً', '3+', true),
  (102, 'toys', 'educational', '🧱', NULL, 'مكعبات بناء تعليمية (100 قطعة)', 'Blocs de construction éducatifs (100 pièces)', 'Educational building blocks (100 pcs)', 'مجموعة مكعبات ملونة تنمّي الإبداع والتفكير المنطقي لدى الطفل، آمنة وخالية من المواد الضارة.', 'Ensemble de blocs colorés qui développent la créativité et la logique de l''enfant, sûrs et sans substances nocives.', 'A set of colorful blocks that build a child''s creativity and logic — safe and free of harmful materials.', 1800, NULL, NULL, '3+', true),
  (103, 'toys', 'misc-toys', '🧸', NULL, 'دمية قماشية ناعمة', 'Peluche douce', 'Soft plush toy', 'دبدوب ناعم الملمس بحشوة قطنية آمنة، رفيق مثالي لنوم الأطفال ولعبهم.', 'Ours en peluche tout doux avec rembourrage coton sûr, compagnon idéal pour le sommeil et le jeu.', 'A soft teddy bear with safe cotton stuffing — the perfect companion for sleep and play.', 2100, NULL, 'جديد', '0+', true),
  (104, 'toys', 'educational', '🔷', NULL, 'لعبة الأشكال والألوان', 'Jeu des formes et couleurs', 'Shapes and colors game', 'لعبة تركيب الأشكال الهندسية تساعد على تعلّم الألوان والأشكال وتطوير المهارات الحركية.', 'Jeu d''encastrement des formes géométriques pour apprendre les couleurs et développer la motricité.', 'A shape-sorting game that teaches colors and shapes and develops motor skills.', 1500, NULL, NULL, '1+', true),
  (105, 'toys', 'vehicles', '🚂', NULL, 'قطار كهربائي بمسار', 'Train électrique avec circuit', 'Electric train with track', 'قطار يعمل بالبطاريات مع مسار كامل وإشارات ضوئية وصوتية، متعة لا تنتهي.', 'Train à piles avec circuit complet, signaux lumineux et sonores — un plaisir sans fin.', 'Battery-powered train with a full track and light and sound signals — endless fun.', 4500, 5200, NULL, '3+', true),
  (106, 'toys', 'art', '🎨', NULL, 'عجينة الصلصال (12 لون)', 'Pâte à modeler (12 couleurs)', 'Modeling clay (12 colors)', 'علبة صلصال آمن بألوان زاهية مع أدوات تشكيل، لتنمية الإبداع والتحكم الحركي.', 'Boîte de pâte à modeler sûre aux couleurs vives avec outils, pour la créativité et la motricité.', 'A box of safe, brightly colored clay with shaping tools to build creativity and fine motor control.', 900, NULL, 'عرض', '3+', true),
  (107, 'toys', 'educational', '🧩', NULL, 'بازل خشبي تعليمي', 'Puzzle en bois éducatif', 'Educational wooden puzzle', 'أحجية خشبية متينة تنمّي التركيز والذاكرة والقدرة على حل المشكلات.', 'Puzzle en bois robuste qui développe la concentration, la mémoire et la résolution de problèmes.', 'A sturdy wooden puzzle that builds focus, memory and problem-solving.', 1300, NULL, NULL, '2+', true),
  (108, 'toys', 'misc-toys', '⚽', NULL, 'كرة قدم مطاطية', 'Ballon de football en caoutchouc', 'Rubber football', 'كرة متينة بحجم مناسب للأطفال، مثالية للعب في الحديقة أو الساحة.', 'Ballon résistant de taille adaptée aux enfants, idéal pour jouer au jardin ou dans la cour.', 'A durable, kid-sized ball, perfect for playing in the garden or yard.', 1200, NULL, NULL, '4+', true),
  (109, 'toys', 'misc-toys', '🍳', NULL, 'طقم مطبخ للأطفال', 'Cuisine jouet pour enfants', 'Kids'' kitchen set', 'مطبخ تفاعلي مع أواني وإكسسوارات، يحفّز اللعب التخيّلي لدى الأطفال.', 'Cuisine interactive avec ustensiles et accessoires, qui stimule le jeu d''imagination.', 'An interactive kitchen with pots and accessories that sparks imaginative play.', 3800, 4600, 'الأكثر مبيعاً', '3+', true),
  (110, 'toys', 'misc-toys', '🤖', NULL, 'روبوت راقص بالأضواء', 'Robot dansant lumineux', 'Dancing robot with lights', 'روبوت يرقص ويضيء ويصدر أصواتاً ممتعة، يعمل بالبطاريات.', 'Robot qui danse, s''illumine et émet des sons amusants, fonctionne à piles.', 'A robot that dances, lights up and makes fun sounds — battery powered.', 2900, NULL, 'جديد', '3+', true),
  (111, 'toys', 'art', '🖍️', NULL, 'لوحة رسم مغناطيسية', 'Ardoise magique', 'Magnetic drawing board', 'لوحة رسم قابلة للمسح مراراً بدون فوضى، مثالية للرسم والكتابة الأولى.', 'Ardoise effaçable à volonté sans salir, idéale pour dessiner et écrire les premières fois.', 'An erasable drawing board with no mess — perfect for early drawing and writing.', 1600, NULL, NULL, '2+', true),
  (112, 'toys', 'vehicles', '🚁', NULL, 'طائرة درون صغيرة للأطفال', 'Mini drone pour enfants', 'Mini drone for kids', 'درون سهل التحكم بحماية للمراوح، مناسب للمبتدئين الصغار.', 'Drone facile à piloter avec protège-hélices, adapté aux jeunes débutants.', 'An easy-to-fly drone with propeller guards, suited to young beginners.', 5500, 6500, NULL, '8+', false)
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- Storage bucket for product images (uploaded from the admin
-- dashboard). Public read so product photos show on the site,
-- write restricted to a signed-in admin.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- ------------------------------------------------------------
-- Subcategories (managed from the admin dashboard, not hardcoded
-- in the app anymore) — each belongs to one of the two top-level
-- categories ('toys' or 'kids').
-- ------------------------------------------------------------
create table if not exists public.subcategories (
  slug text primary key,
  category text not null check (category in ('toys', 'kids')),
  emoji text,
  label_ar text not null,
  label_fr text,
  label_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subcategories enable row level security;

drop policy if exists "Public read subcategories" on public.subcategories;
create policy "Public read subcategories" on public.subcategories
  for select using (true);

drop policy if exists "Admins can insert subcategories" on public.subcategories;
create policy "Admins can insert subcategories" on public.subcategories
  for insert to authenticated with check (true);

drop policy if exists "Admins can update subcategories" on public.subcategories;
create policy "Admins can update subcategories" on public.subcategories
  for update to authenticated using (true) with check (true);

drop policy if exists "Admins can delete subcategories" on public.subcategories;
create policy "Admins can delete subcategories" on public.subcategories
  for delete to authenticated using (true);

-- Seed: the 8 subcategories the site already used (safe to re-run)
insert into public.subcategories (slug, category, emoji, label_ar, label_fr, label_en, sort_order)
values
  ('educational', 'toys', '🧩', 'ألعاب تعليمية', 'Jouets éducatifs', 'Educational toys', 1),
  ('vehicles', 'toys', '🚗', 'سيارات ومركبات', 'Voitures et véhicules', 'Cars & vehicles', 2),
  ('art', 'toys', '🎨', 'أدوات الرسم', 'Matériel de dessin', 'Art supplies', 3),
  ('misc-toys', 'toys', '🎮', 'ألعاب متنوعة', 'Jouets variés', 'Assorted toys', 4),
  ('baby-care', 'kids', '🧴', 'العناية بالطفل', 'Soins bébé', 'Baby care', 5),
  ('feeding', 'kids', '🍼', 'الرضاعة والتغذية', 'Repas et biberons', 'Feeding', 6),
  ('kids-clothes', 'kids', '👕', 'ملابس الأطفال', 'Vêtements enfants', 'Kids clothing', 7),
  ('kids-accessories', 'kids', '🎀', 'إكسسوارات الأطفال', 'Accessoires enfants', 'Kids accessories', 8)
on conflict (slug) do nothing;

-- ============================================================
-- الطلبات (orders): الزبون يرسل الطلب فقط، والمدير وحده يقرأ ويعدّل
-- ============================================================
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 20),
  wilaya text check (char_length(wilaya) <= 60),
  address text check (char_length(address) <= 300),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50),
  total integer not null check (total >= 0),
  notes text check (char_length(notes) <= 500),
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists ref text unique check (char_length(ref) <= 20);
alter table public.orders add column if not exists delivery_type text check (delivery_type in ('home','office'));
alter table public.orders add column if not exists delivery_price integer check (delivery_price >= 0);

alter table public.orders enable row level security;

drop policy if exists "Anyone can place orders" on public.orders;
create policy "Anyone can place orders" on public.orders
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders
  for select to authenticated using ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders" on public.orders
  for delete to authenticated using ((auth.jwt() ->> 'email') = 'aimen.bouss96@gmail.com');

create index if not exists orders_created_at_idx on public.orders (created_at desc);
