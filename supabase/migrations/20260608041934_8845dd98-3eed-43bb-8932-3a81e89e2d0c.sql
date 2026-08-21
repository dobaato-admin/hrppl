
DO $$ BEGIN
  PERFORM cron.unschedule('blog-webhook-deliveries');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'blog-webhook-deliveries',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app/api/public/hooks/blog-webhook-deliveries',
    headers := jsonb_build_object('Content-Type','application/json','apikey','sb_publishable_OBG86LiuqXVciMeu-bVSBQ_EPE4OIpL'),
    body := '{}'::jsonb
  );
  $$
);
