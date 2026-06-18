from services.supabase_service import SupabaseService
import uuid

def test_alert_creation_logic(monkeypatch):
    class MockClient:
        def table(self, name):
            self.name = name
            return self
        def insert(self, data):
            self.data = data
            return self
        def execute(self):
            return {"status": "success"}

    mock_client = MockClient()
    
    service = SupabaseService()
    service.client = mock_client
    
    alert_id = f"ALT-{str(uuid.uuid4())[:8]}"
    service.create_alert(alert_id, "rep-123", "CRITICAL", "CRITICAL_ADR")
    
    assert mock_client.name == "alerts"
    assert mock_client.data["severity"] == "CRITICAL"
    assert mock_client.data["alert_type"] == "CRITICAL_ADR"
    assert mock_client.data["status"] == "PENDING"
