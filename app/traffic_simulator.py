"""
Simple Network Traffic Generator.
Generates normal packets and simulated attack packets.
"""

import random

packet_counter = 100

def create_packet(traffic_type="normal"):
    """
    Creates a simulated packet with 4 simple features:
    [duration, src_bytes, dst_bytes, connection_count]
    """
    global packet_counter
    packet_counter += 1
    pkt_id = f"PKT-{packet_counter}"
    
    if traffic_type == "syn_flood":
        # SYN Flood: Huge connection count, 0 bytes returned
        return {
            "id": pkt_id,
            "type": "SYN Flood Attack",
            "duration": 0.01,
            "src_bytes": 40,
            "dst_bytes": 0,
            "count": random.randint(300, 600)
        }
        
    elif traffic_type == "port_scan":
        # Port Scan: Rapid scanning across many ports
        return {
            "id": pkt_id,
            "type": "Port Scan Attack",
            "duration": 0.05,
            "src_bytes": 60,
            "dst_bytes": 20,
            "count": random.randint(80, 150)
        }
        
    else:
        # Normal Web Browsing: Standard bytes, low count
        return {
            "id": pkt_id,
            "type": "Normal Traffic",
            "duration": round(random.uniform(0.2, 1.5), 2),
            "src_bytes": random.randint(200, 1200),
            "dst_bytes": random.randint(1000, 8000),
            "count": random.randint(1, 8)
        }
