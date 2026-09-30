"""
Simple FastAPI Backend Server.
Provides basic endpoints to serve the dashboard and analyze packets.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.ml_pipeline import detector
from app.traffic_simulator import create_packet

app = FastAPI(title="NETWORK ANOMALY Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Serve static files (HTML, CSS, JS)
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class PacketRequest(BaseModel):
    traffic_type: str = "normal"
    count: int = 1


@app.get("/")
def home():
    """Serves the dashboard HTML."""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@app.get("/healthz")
def health_check():
    """Health check for Render."""
    return {"status": "ok", "service": "network-anomaly"}


@app.get("/api/data")
@app.get("/api/telemetry")
def get_dashboard_data():
    """Returns packet stats and recent points for the graph."""
    return detector.get_stats()


@app.get("/api/kmeans")
def get_kmeans_data():
    """Returns dedicated K-Means analysis data."""
    stats = detector.get_stats()
    return {
        "summary": stats["kmeans"],
        "total": stats["total"],
        "history": [
            {
                "id": p["id"],
                "type": p["type"],
                "x": p["x"],
                "y": p["y"],
                "cluster": p.get("cluster", 0),
                "distance": p.get("distance", 0.0),
                "threshold": stats["kmeans"]["threshold"],
                "is_outlier": p.get("kmeans_outlier", p.get("kmeans_result") == "Outlier"),
                "result": p.get("kmeans_result")
            }
            for p in stats["history"]
        ]
    }


@app.get("/api/dbscan")
def get_dbscan_data():
    """Returns dedicated DBSCAN analysis data."""
    stats = detector.get_stats()
    return {
        "summary": stats["dbscan"],
        "total": stats["total"],
        "history": [
            {
                "id": p["id"],
                "type": p["type"],
                "x": p["x"],
                "y": p["y"],
                "dbscan_label": p.get("dbscan_label", 0),
                "is_noise": p.get("dbscan_noise", p.get("dbscan_result") == "Noise (-1)"),
                "result": p.get("dbscan_result")
            }
            for p in stats["history"]
        ]
    }



@app.post("/api/send")
@app.post("/api/inject")
def inject_packets(req: PacketRequest):
    """
    Creates and analyzes 1 or more packets.
    traffic_type can be: 'normal', 'syn_flood', or 'port_scan'.
    """
    results = []
    count = max(1, min(20, req.count))
    
    for _ in range(count):
        pkt = create_packet(req.traffic_type)
        analyzed = detector.analyze_packet(
            pkt_id=pkt["id"],
            pkt_type=pkt["type"],
            duration=pkt["duration"],
            src_bytes=pkt["src_bytes"],
            dst_bytes=pkt["dst_bytes"],
            count=pkt["count"]
        )
        results.append(analyzed)
        
    return {"message": "Success", "added": len(results), "stats": detector.get_stats()}


@app.post("/api/reset")
@app.post("/api/clear")
def reset_dashboard():
    """Resets the data back to initial baseline."""
    detector.reset()
    return {"message": "Reset complete", "stats": detector.get_stats()}
