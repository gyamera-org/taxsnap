-- Enable realtime for beauty products table
-- Run this in your Supabase SQL Editor

-- Enable realtime on the user_beauty_products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_beauty_products;

-- Also enable for beauty product logs if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.beauty_product_logs;
