-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    starting_cash NUMERIC NOT NULL DEFAULT 0,
    ending_cash NUMERIC,
    expected_cash NUMERIC,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up RLS (Row Level Security) for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view expenses for their gyms" ON public.expenses;
CREATE POLICY "Owners can view expenses for their gyms"
    ON public.expenses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can insert expenses for their gyms" ON public.expenses;
CREATE POLICY "Owners can insert expenses for their gyms"
    ON public.expenses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update expenses for their gyms" ON public.expenses;
CREATE POLICY "Owners can update expenses for their gyms"
    ON public.expenses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can delete expenses for their gyms" ON public.expenses;
CREATE POLICY "Owners can delete expenses for their gyms"
    ON public.expenses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = expenses.gym_id AND g.owner_id = auth.uid()
        )
    );

-- 4. Set up RLS for shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shifts for their gyms" ON public.shifts;
CREATE POLICY "Users can view shifts for their gyms"
    ON public.shifts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = shifts.gym_id AND g.owner_id = auth.uid()
        ) OR
        auth.uid() = admin_id
    );

DROP POLICY IF EXISTS "Admins can insert their own shifts" ON public.shifts;
CREATE POLICY "Admins can insert their own shifts"
    ON public.shifts FOR INSERT
    WITH CHECK (
        auth.uid() = admin_id
    );

DROP POLICY IF EXISTS "Admins can update their own shifts" ON public.shifts;
CREATE POLICY "Admins can update their own shifts"
    ON public.shifts FOR UPDATE
    USING (
        auth.uid() = admin_id
    );

DROP POLICY IF EXISTS "Owners can view all shifts for their gyms" ON public.shifts;
CREATE POLICY "Owners can view all shifts for their gyms"
    ON public.shifts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.gyms g
            WHERE g.id = shifts.gym_id AND g.owner_id = auth.uid()
        )
    );
