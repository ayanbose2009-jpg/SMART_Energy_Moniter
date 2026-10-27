import os, tempfile
os.environ["ENERWISE_DB"] = os.path.join(tempfile.mkdtemp(), "t.db")
from fastapi.testclient import TestClient
from main import app
c = TestClient(app)
assert len(c.get("/api/appliances").json()) == 6
for a in c.get("/api/appliances").json(): c.delete(f"/api/appliances/{a['id']}")
assert c.get("/api/summary").json()["totalKwh"] == 0
r = c.post("/api/appliances", json={"name": "Test", "category": "Other", "watts": 100, "hoursPerDay": 5, "daysPerMonth": 30}); assert r.status_code == 201
s = c.get("/api/summary").json(); assert s["totalKwh"] == 15 and s["energyCost"] == 120 and s["estimatedBill"] == 120
assert c.put("/api/settings", json={"tariff": 8, "fixedCharge": 50}).status_code == 200 and c.get("/api/summary").json()["estimatedBill"] == 170
for bad in ({"name":" ","watts":1,"hoursPerDay":1,"daysPerMonth":1},{"name":"x","watts":-1,"hoursPerDay":1,"daysPerMonth":1},
            {"name":"x","watts":1,"hoursPerDay":25,"daysPerMonth":1},{"name":"x","watts":1,"hoursPerDay":1,"daysPerMonth":32}):
    assert c.post("/api/appliances", json=bad).status_code == 422
sim = c.post("/api/simulate", json={"applianceId": r.json()["id"], "proposedHours": 4}).json()
assert sim["savedKwh"] == 3 and c.get("/api/appliances").json()[0]["hoursPerDay"] == 5   # baseline untouched
assert "Test" in c.get("/api/export.csv").text
assert len(c.post("/api/reset").json()["appliances"]) == 6
print("All backend tests passed.")
