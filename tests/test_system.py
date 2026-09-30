"""
Simple and Fast Test Suite.
Tests ML clustering, traffic generation, and FastAPI endpoints.
"""

from httpx import AsyncClient, ASGITransport
import pytest

from app.api import app
from app.ml_pipeline import detector
from app.traffic_simulator import create_packet


def test_ml_detection():
    """Test that normal packets are SAFE and attacks are ANOMALIES."""
    # Normal packet
    res_normal = detector.analyze_packet("TEST-1", "Normal", 0.5, 300, 2000, 3)
    assert res_normal["is_anomaly"] is False
    assert res_normal["kmeans_result"] == "Normal"

    # Extreme attack packet (SYN Flood: 500 connections, 0 bytes returned)
    res_attack = detector.analyze_packet("TEST-2", "SYN Flood", 0.01, 40, 0, 500)
    assert res_attack["is_anomaly"] is True
    assert res_attack["kmeans_result"] == "Outlier"


def test_traffic_generation():
    """Test that traffic simulator creates valid packet dictionaries."""
    normal_pkt = create_packet("normal")
    assert "src_bytes" in normal_pkt
    assert normal_pkt["count"] < 20

    syn_pkt = create_packet("syn_flood")
    assert syn_pkt["count"] >= 300


@pytest.mark.asyncio
async def test_api_routes():
    """Test web server endpoints."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        res_health = await client.get("/healthz")
        assert res_health.status_code == 200

        # 2. Web UI HTML page
        res_home = await client.get("/")
        assert res_home.status_code == 200
        assert "NETWORK ANOMALY" in res_home.text

        # 3. Data endpoint
        res_data = await client.get("/api/data")
        assert res_data.status_code == 200
        assert "total" in res_data.json()

        # 4. Inject attack endpoint
        res_send = await client.post("/api/send", json={"traffic_type": "syn_flood", "count": 2})
        assert res_send.status_code == 200
        assert res_send.json()["added"] == 2
