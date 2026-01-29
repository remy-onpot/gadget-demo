-- Experts Table
create table public.experts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  specialties text[] not null default array[]::text[], -- ['setup', 'products', 'design']
  avatar_url text,
  status text not null default 'active', -- 'active', 'inactive', 'onboarding'
  jobs_completed integer not null default 0,
  rating numeric(3,2) default 0.0, -- Average rating out of 5.0
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone default now(),
  
  constraint experts_pkey primary key (id),
  constraint experts_user_id_unique unique (user_id)
) tablespace pg_default;

-- Expert Requests Table
create table public.expert_requests (
  id uuid not null default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  store_name text not null,
  store_slug text not null,
  requester_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null, -- 'setup', 'products', 'design'
  selected_expert_id uuid references public.experts(id) on delete set null, -- Customer's choice
  assigned_expert_id uuid references public.experts(id) on delete set null, -- Super admin can reassign
  contact_phone text not null,
  status text not null default 'pending', -- 'pending', 'payment_received', 'in_progress', 'completed', 'cancelled'
  payment_status text not null default 'unpaid', -- 'unpaid', 'escrowed', 'released_to_expert', 'refunded'
  total_amount numeric(10,2) not null default 0, -- Total customer pays (e.g., 250)
  platform_fee numeric(10,2) not null default 0, -- Your cut (e.g., 50)
  expert_payout numeric(10,2) not null default 0, -- Expert gets (e.g., 200)
  payment_reference text, -- MoMo/Paystack transaction ID
  notes text,
  completion_proof_url text, -- Expert uploads screenshot/link
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone default now(),
  
  constraint expert_requests_pkey primary key (id)
) tablespace pg_default;

-- Create indexes
create index idx_experts_user_id on public.experts(user_id);
create index idx_experts_status on public.experts(status);
create index idx_expert_requests_store_id on public.expert_requests(store_id);
create index idx_expert_requests_selected_expert on public.expert_requests(selected_expert_id);
create index idx_expert_requests_status on public.expert_requests(status);
create index idx_expert_requests_created_at on public.expert_requests(created_at desc);

-- Enable RLS
alter table public.experts enable row level security;
alter table public.expert_requests enable row level security;

-- RLS Policies for experts table
-- Anyone can view active experts (for marketplace)
create policy "Anyone can view active experts"
  on public.experts for select
  using (status = 'active');

-- Experts can view their own profile
create policy "Experts can view own profile"
  on public.experts for select
  using (auth.uid() = user_id);

-- RLS Policies for expert_requests
-- Store owners can view their own requests
create policy "Store owners can view own requests"
  on public.expert_requests for select
  using (auth.uid() = requester_id);

-- Store owners can insert their own requests
create policy "Store owners can create requests"
  on public.expert_requests for insert
  with check (auth.uid() = requester_id);

-- Experts can view requests assigned to them
create policy "Experts can view assigned requests"
  on public.expert_requests for select
  using (
    exists (
      select 1 from public.experts
      where experts.user_id = auth.uid()
      and (experts.id = expert_requests.selected_expert_id 
           or experts.id = expert_requests.assigned_expert_id)
    )
  );

-- Experts can update their assigned requests (status, proof)
create policy "Experts can update assigned requests"
  on public.expert_requests for update
  using (
    exists (
      select 1 from public.experts
      where experts.user_id = auth.uid()
      and (experts.id = expert_requests.selected_expert_id 
           or experts.id = expert_requests.assigned_expert_id)
    )
  );

-- Updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_experts_updated_at
  before update on public.experts
  for each row
  execute function public.handle_updated_at();

create trigger set_expert_requests_updated_at
  before update on public.expert_requests
  for each row
  execute function public.handle_updated_at();

