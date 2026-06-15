from services.supabase_service import SupabaseService
try:
    svc = SupabaseService()
    print("Report:", svc.get_report("VG-878CE505"))
except Exception as e:
    import traceback
    traceback.print_exc()
