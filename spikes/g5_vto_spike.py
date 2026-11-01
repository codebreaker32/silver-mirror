import json, os, sys, time, urllib.request, urllib.error
BASE = "https://yce-api-01.makeupar.com"
KEY = os.environ["YOUCAM_API_KEY"]
OUT = os.path.dirname(os.path.abspath(__file__))
SAMPLE = "https://plugins-media.makeupar.com/strapi/assets/sample_Image_1_202b6bf6e6.jpg"

def call(method, path, body=None):
    time.sleep(1.3)
    req = urllib.request.Request(BASE + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")

variants = {
    "foundation_deep": {"src_file_url": SAMPLE, "version": "1.0", "effects": [
        {"category": "foundation", "palettes": [{"color": "#A8774F", "colorIntensity": 60, "glowIntensity": 30, "coverageIntensity": 40}]},
        {"category": "skin_smooth", "skinSmoothStrength": 10, "skinSmoothColorIntensity": 10}]},
    "lip_sheer": {"src_file_url": SAMPLE, "version": "1.0", "effects": [
        {"category": "lip_color", "shape": {"name": "original"}, "style": {"type": "full"},
         "palettes": [{"color": "#B5535C", "texture": "sheer", "colorIntensity": 60, "gloss": 40, "transparencyIntensity": 40}]}]},
}
for name, body in variants.items():
    st, created = call("POST", "/s2s/v2.0/task/makeup-vto", body)
    print(name, "create", st, json.dumps(created)[:250])
    tid = (created.get("data") or {}).get("task_id")
    rec = {"request": body, "create": created}
    if tid:
        t0 = time.time()
        while True:
            time.sleep(3)
            st, res = call("GET", f"/s2s/v2.0/task/makeup-vto/{tid}")
            s = (res.get("data") or {}).get("task_status")
            if s in ("success", "error") or time.time() - t0 > 120:
                break
        rec.update(result=res, latency_s=round(time.time() - t0, 1))
        print(name, s, rec["latency_s"], json.dumps(res)[:300])
        url = None
        r = (res.get("data") or {}).get("results")
        if isinstance(r, dict): url = r.get("url")
        elif isinstance(r, list) and r: url = r[0].get("url") or r[0].get("download_url")
        if url:
            urllib.request.urlretrieve(url, os.path.join(OUT, f"g5_{name}.jpg"))
        st, d = call("POST", "/s2s/v2.0/task/delete", {"task_id": tid})
        rec["delete"] = {"status": st, "body": d}
    json.dump(rec, open(os.path.join(OUT, f"g5_{name}.json"), "w"), indent=1)
