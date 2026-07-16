-- GrantHelper requirement enrichment
--
-- Problem: many grants (the original seed set, and the first version of the
-- 0003 seed) were stored with only degree_levels filled in, so their detail
-- page shows a single requirement ("Уровень обучения") and the matching engine
-- has almost nothing to compare against.
--
-- This migration fills approximate admission requirements (GPA on a 4.0 scale,
-- an English test, and SAT for undergraduate-only awards) on any grant that is
-- still missing them, so every grant shows several criteria.
--
-- SAFE TO RUN REPEATEDLY. Every field is written with COALESCE(existing, value),
-- so it only fills nulls and never overwrites a figure that is already set
-- (including the researched values in 0003). It performs no INSERT, so it can
-- never create duplicate grants.
--
-- The figures are APPROXIMATE typical profiles of admitted or awarded students,
-- NOT official cut-offs. Verify exact numbers on each programme's website.

-- ---------------------------------------------------------------------------
-- 1. Researched refinements for well-known programmes (matched loosely by name).
--    COALESCE keeps any value already stored; these only apply where a field
--    is currently empty.
-- ---------------------------------------------------------------------------
update public.grants set
  min_gpa   = coalesce(min_gpa, 3.30),
  min_ielts = coalesce(min_ielts, 6.5),
  min_toefl = coalesce(min_toefl, 79)
  where name ilike '%chevening%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.30),
  min_ielts = coalesce(min_ielts, 7.0),
  min_toefl = coalesce(min_toefl, 90)
  where name ilike '%fulbright%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.70),
  min_ielts = coalesce(min_ielts, 7.5),
  min_toefl = coalesce(min_toefl, 110)
  where name ilike '%gates cambridge%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.70),
  min_ielts = coalesce(min_ielts, 7.0),
  min_toefl = coalesce(min_toefl, 100),
  age_max   = coalesce(age_max, 24)
  where name ilike '%rhodes%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.60),
  min_ielts = coalesce(min_ielts, 7.0),
  min_toefl = coalesce(min_toefl, 100)
  where name ilike '%clarendon%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.60),
  min_ielts = coalesce(min_ielts, 7.0),
  min_toefl = coalesce(min_toefl, 100)
  where name ilike '%knight%hennessy%' or name ilike '%knight-hennessy%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.20),
  min_ielts = coalesce(min_ielts, 6.5),
  min_toefl = coalesce(min_toefl, 90)
  where name ilike '%erasmus mundus%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.20),
  min_ielts = coalesce(min_ielts, 6.0),
  min_toefl = coalesce(min_toefl, 80)
  where name ilike '%daad%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.00),
  min_ielts = coalesce(min_ielts, 5.5),
  min_toefl = coalesce(min_toefl, 71)
  where name ilike '%korea scholarship%' or name ilike '%gks%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.20),
  min_ielts = coalesce(min_ielts, 6.0),
  min_toefl = coalesce(min_toefl, 79)
  where name ilike '%mext%' or name ilike '%monbukagakusho%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.00),
  min_ielts = coalesce(min_ielts, 6.0),
  min_toefl = coalesce(min_toefl, 79)
  where name ilike '%rkiye%' or name ilike '%turkiye%' or name ilike '%turkey%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.20),
  min_ielts = coalesce(min_ielts, 6.5),
  min_toefl = coalesce(min_toefl, 90)
  where name ilike '%swedish institute%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.40),
  min_ielts = coalesce(min_ielts, 6.5),
  min_toefl = coalesce(min_toefl, 90),
  age_max   = coalesce(age_max, 30)
  where name ilike '%eiffel%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.00),
  min_ielts = coalesce(min_ielts, 5.5),
  min_toefl = coalesce(min_toefl, 72)
  where name ilike '%stipendium hungaricum%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.00),
  min_ielts = coalesce(min_ielts, 6.0),
  min_toefl = coalesce(min_toefl, 80)
  where name ilike '%orange knowledge%';

update public.grants set
  min_gpa   = coalesce(min_gpa, 3.60),
  min_ielts = coalesce(min_ielts, 7.0),
  min_toefl = coalesce(min_toefl, 100)
  where name ilike '%schwarzman%' or name ilike '%yenching%';

-- ---------------------------------------------------------------------------
-- 2. Blanket safety net: guarantee every remaining grant has a GPA and an
--    English test, so no grant is left with a single requirement. Tiered by
--    funding type (full awards are more competitive than partial ones).
-- ---------------------------------------------------------------------------
update public.grants set
  min_gpa = coalesce(min_gpa, case when funding_type = 'full' then 3.20 else 3.00 end)
  where min_gpa is null;

update public.grants set
  min_ielts = case when funding_type = 'full' then 6.5 else 6.0 end,
  min_toefl = case when funding_type = 'full' then 88 else 80 end
  where min_ielts is null and min_toefl is null;

-- ---------------------------------------------------------------------------
-- 3. SAT for undergraduate-only awards that still lack it (adds a criterion for
--    bachelor programmes, where SAT is the relevant standardised test).
-- ---------------------------------------------------------------------------
update public.grants set
  min_sat = coalesce(min_sat, 1250)
  where min_sat is null and degree_levels = ARRAY['bachelor'];
