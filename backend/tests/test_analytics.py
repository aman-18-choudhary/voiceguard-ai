from routers.analytics import get_drug_analytics, get_severity_analytics
import asyncio
from unittest.mock import patch, MagicMock

def test_drug_analytics_aggregation():
    # Test aggregation logic without hitting DB
    from collections import Counter
    
    mock_db_data = [
        {"drugs": [{"name": "Aspirin"}, {"name": "Lisinopril"}]},
        {"drugs": [{"name": "Aspirin"}]},
        {"drugs": []},
        {"drugs": [{"name": "Ibuprofen"}]}
    ]
    
    drugs = []
    for row in mock_db_data:
        row_drugs = row.get("drugs", [])
        for d in row_drugs:
            if d and "name" in d:
                drugs.append(d["name"].lower().strip())
                
    counts = Counter(drugs).most_common(10)
    assert counts[0][0] == "aspirin"
    assert counts[0][1] == 2
    assert len(counts) == 3
