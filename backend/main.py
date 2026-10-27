"""Enerwise API: FastAPI + SQLite. Run: uvicorn main:app --reload --port 8000  (docs at /docs)"""
import csv, io, os, sqlite3, uuid
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

DB = Path(os.environ.get("ENERWISE_DB", Path(__file__).with_name("enerwise.db")))
Category = Literal["Lighting", "Cooling", "Computing", "Kitchen", "Other"]
SAMPLE = [("Ceiling fan","Cooling",75,10,30),("Laptop","Computing",65,6,30),("LED bulbs (4)","Lighting",36,6,30),
          ("Refrigerator","Kitchen",150,8,30),("Air conditioner","Cooling",1200,4,20),("Water heater","Other",2000,0.5,30)]

class ApplianceIn(BaseModel):
    name: str
    category: Category = "Other"
    watts: float = Field(ge=0)
    hoursPerDay: float = Field(ge=0, le=24)
    daysPerMonth: float = Field(ge=0, le=31)
    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v: raise ValueError("Appliance name cannot be empty.")
        return v
class Appliance(ApplianceIn): id: str
class Settings(BaseModel):
    tariff: float = Field(ge=0)
    fixedCharge: float = Field(ge=0)
class SimIn(BaseModel):
    applianceId: str
    proposedHours: float = Field(ge=0, le=24)

def db():
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row; return c
def seed(c, force=False):
    if force: c.execute("DELETE FROM appliances")
    if force or c.execute("SELECT COUNT(*) FROM appliances").fetchone()[0] == 0 and not c.execute("SELECT 1 FROM settings").fetchone():
        for i, s in enumerate(SAMPLE):
            c.execute("INSERT INTO appliances VALUES (?,?,?,?,?,?,?)", (str(uuid.uuid4()), s[0], s[1], s[2], s[3], s[4], i))
    c.execute("INSERT OR REPLACE INTO settings VALUES (1,?,?)", (8, 0)) if force else c.execute("INSERT OR IGNORE INTO settings VALUES (1,8,0)")
def init():
    with db() as c:
        c.execute("CREATE TABLE IF NOT EXISTS appliances(id TEXT PRIMARY KEY,name TEXT,category TEXT,watts REAL,hoursPerDay REAL,daysPerMonth REAL,pos INTEGER)")
        c.execute("CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY,tariff REAL,fixedCharge REAL)")
        seed(c)
def all_appliances(c): return [dict(r) for r in c.execute("SELECT id,name,category,watts,hoursPerDay,daysPerMonth FROM appliances ORDER BY pos")]
def get_settings(c): return dict(c.execute("SELECT tariff,fixedCharge FROM settings WHERE id=1").fetchone())

def monthly_kwh(a): return a["watts"] * a["hoursPerDay"] * a["daysPerMonth"] / 1000  # E = W x h/day x days / 1000

app = FastAPI(title="Enerwise API")
init()

@app.get("/api/appliances")
def list_appliances():
    with db() as c: return all_appliances(c)
@app.post("/api/appliances", response_model=Appliance, status_code=201)
def create(a: ApplianceIn):
    id_ = str(uuid.uuid4())
    with db() as c:
        pos = c.execute("SELECT COALESCE(MAX(pos),-1)+1 FROM appliances").fetchone()[0]
        c.execute("INSERT INTO appliances VALUES (?,?,?,?,?,?,?)", (id_, a.name, a.category, a.watts, a.hoursPerDay, a.daysPerMonth, pos))
    return {**a.model_dump(), "id": id_}
@app.put("/api/appliances/{id_}", response_model=Appliance)
def update(id_: str, a: ApplianceIn):
    with db() as c:
        if not c.execute("UPDATE appliances SET name=?,category=?,watts=?,hoursPerDay=?,daysPerMonth=? WHERE id=?", (a.name, a.category, a.watts, a.hoursPerDay, a.daysPerMonth, id_)).rowcount:
            raise HTTPException(404, "Appliance not found.")
    return {**a.model_dump(), "id": id_}
@app.delete("/api/appliances/{id_}", status_code=204)
def delete(id_: str):
    with db() as c:
        if not c.execute("DELETE FROM appliances WHERE id=?", (id_,)).rowcount: raise HTTPException(404, "Appliance not found.")

@app.get("/api/settings", response_model=Settings)
def read_settings():
    with db() as c: return get_settings(c)
@app.put("/api/settings", response_model=Settings)
def write_settings(s: Settings):
    with db() as c: c.execute("INSERT OR REPLACE INTO settings VALUES (1,?,?)", (s.tariff, s.fixedCharge))
    return s
@app.post("/api/reset")
def reset():
    with db() as c:
        seed(c, force=True)
        return {"appliances": all_appliances(c), "settings": get_settings(c)}

def build_summary():
    with db() as c: items, s = all_appliances(c), get_settings(c)
    total = sum(monthly_kwh(a) for a in items)
    rows = [{**a, "kwh": monthly_kwh(a), "cost": monthly_kwh(a) * s["tariff"], "sharePct": monthly_kwh(a) / total * 100 if total else 0} for a in items]
    cost = total * s["tariff"]
    return {"appliances": rows, "totalKwh": total, "energyCost": cost, "estimatedBill": cost + s["fixedCharge"], "settings": s}
@app.get("/api/summary")
def summary(): return build_summary()

@app.post("/api/simulate")  # read-only: never modifies stored data
def simulate(b: SimIn):
    with db() as c:
        row = c.execute("SELECT * FROM appliances WHERE id=?", (b.applianceId,)).fetchone(); s = get_settings(c)
    if not row: raise HTTPException(404, "Appliance not found.")
    a = dict(row); base = monthly_kwh(a); prop = monthly_kwh({**a, "hoursPerDay": b.proposedHours}); saved = max(0, base - prop)
    return {"baselineKwh": base, "proposedKwh": prop, "savedKwh": saved, "savedCost": saved * s["tariff"], "note": "Hypothetical estimate, not guaranteed savings."}

@app.get("/api/export.csv")
def export_csv():
    d = build_summary(); out = io.StringIO(); w = csv.writer(out, quoting=csv.QUOTE_ALL)
    w.writerow(["Appliance","Category","Power (W)","Hours/day","Days/month","Monthly energy (kWh)","Energy cost (INR)","Share (%)"])
    for r in d["appliances"]: w.writerow([r["name"],r["category"],r["watts"],r["hoursPerDay"],r["daysPerMonth"],round(r["kwh"],3),round(r["cost"],2),round(r["sharePct"],1)])
    w.writerow([]); w.writerow(["Total energy (kWh)", round(d["totalKwh"],3)]); w.writerow(["Tariff (INR/kWh)", d["settings"]["tariff"]])
    w.writerow(["Fixed charge (INR)", d["settings"]["fixedCharge"]]); w.writerow(["Estimated bill (INR)", round(d["estimatedBill"],2)])
    return Response("\ufeff" + out.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="enerwise-report.csv"'})

DIST = Path(__file__).parent.parent / "dist"   # after `npm run build`, the API also serves the UI on one port
if DIST.exists(): app.mount("/", StaticFiles(directory=DIST, html=True), name="ui")
