-- 1. Create expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Set up RLS (Row Level Security)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Only Owners can view and manage their gym's expenses
CREATE POLICY "Owners can view expenses for their gyms"
    ON public.expenses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert expenses for their gyms"
    ON public.expenses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update expenses for their gyms"
    ON public.expenses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete expenses for their gyms"
    ON public.expenses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );
