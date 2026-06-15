
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies on contracts bucket
CREATE POLICY "admins read contracts" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete contracts" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'));
