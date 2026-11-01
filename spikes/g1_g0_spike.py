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

def save(name, obj):
    json.dump(obj, open(os.path.join(OUT, name), "w"), indent=1)

body = {"src_file_url": SAMPLE,
        "dst_actions": ["hd_skin_type", "hd_oiliness", "hd_moisture", "hd_redness", "hd_pore"],
        "miniserver_args": {"enable_mask_overlay": True},
        "format": "json"}
st, created = call("POST", "/s2s/v2.1/task/skin-analysis", body)
save("g1_create.json", {"status": st, "body": created, "request": body})
print("create", st, json.dumps(created)[:300])
tid = (created.get("data") or {}).get("task_id")
if not tid:
    sys.exit(1)
t0 = time.time()
while True:
    time.sleep(3)
    st, res = call("GET", f"/s2s/v2.1/task/skin-analysis/{tid}")
    s = (res.get("data") or {}).get("task_status")
    print("poll", st, s, round(time.time() - t0, 1))
    if s in ("success", "error") or time.time() - t0 > 180:
        break
save("g1_result.json", {"status": st, "body": res, "latency_s": round(time.time() - t0, 1)})

st, deleted = call("POST", "/s2s/v2.0/task/delete", {"task_id": tid})
save("g0_delete.json", {"status": st, "body": deleted})
print("delete", st, json.dumps(deleted)[:300])
st, after = call("GET", f"/s2s/v2.1/task/skin-analysis/{tid}")
save("g0_get_after_delete.json", {"status": st, "body": after})
print("get-after-delete", st, json.dumps(after)[:300])
