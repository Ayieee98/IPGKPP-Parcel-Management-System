alter table public.users replica identity full;
alter table public.parcels replica identity full;
alter table public.racks replica identity full;

alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.parcels;
alter publication supabase_realtime add table public.racks;
