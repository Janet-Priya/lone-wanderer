
-- Add item_effect to journal_entries to store the full item details from quests
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS item_effect TEXT;

-- Create a table to manage the user's inventory of sacred items
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_effect TEXT NOT NULL,
    is_equipped BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for the new inventory table
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access and manage their own items
CREATE POLICY "Users can view their own inventory"
ON public.user_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
ON public.user_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items (e.g., equip/unequip)"
ON public.user_inventory FOR UPDATE
USING (auth.uid() = user_id);
