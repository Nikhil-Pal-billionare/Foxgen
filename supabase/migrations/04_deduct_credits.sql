create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_meta jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  -- Deduct credits safely
  update credits
  set balance = balance - p_amount
  where user_id = p_user_id
    and balance >= p_amount;

  if not found then
    raise exception 'Insufficient credits';
  end if;

  -- Log usage
  insert into credit_logs (
    user_id,
    amount,
    reason,
    meta
  )
  values (
    p_user_id,
    p_amount,
    p_reason,
    p_meta
  );
end;
$$;
