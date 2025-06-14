
CREATE OR REPLACE FUNCTION public.increment_xp(user_id_to_update uuid, xp_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.user_stats
  SET 
    xp = COALESCE(xp, 0) + xp_to_add,
    level = floor((COALESCE(xp, 0) + xp_to_add) / 100) + 1
  WHERE user_id = user_id_to_update;
END;
$$;
