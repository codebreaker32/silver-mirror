# Hour-0 spike findings (real YouCam API, 2026-11-01 ~17:20 UTC)

Input: Perfect Corp's official docs sample face (`https://plugins-media.makeupar.com/strapi/assets/sample_Image_1_202b6bf6e6.jpg`, 1080×1437). This is vendor-provided test media; no real user's face was used. Units spent: 16 (HD scan) + 2 (VTO) = **18**. Balance is now about 1,022.

## G1: HD skin analysis (`POST /s2s/v2.1/task/skin-analysis`, `src_file_url`): PASS
- `src_file_url` works directly. No upload is needed when the image is at a public URL; the app will still use the file upload.
- Latency: success on the first poll at 5.4 s.
- `data.results.output[]` items:
  - `{type, raw_score, ui_score, mask_urls[1]}` for hd_redness, hd_oiliness and hd_moisture.
  - `hd_skin_type` comes back **per region**: `{type:"hd_skin_type", region:"whole"|"t_zone"|"u_zone", skin_type:"Normal"}`. **Zone labels exist, so copy set A is usable.**
  - `hd_pore` comes back per region: forehead, nose, cheek, whole.
  - It also returns `{type:"all", score}`, `{type:"skin_age", score}` (**discard both, per the spec**) and `{type:"resize_image"}` with a mask url.
- **Score direction:** on this airbrushed sample, hd_oiliness raw = 99.5, hd_pore = 100, hd_redness = 96.2, hd_moisture = 80.7. **Higher raw_score means healthier, i.e. less visible concern.** So the band "Oiliness reading: High" must map to a LOW raw_score. Cutoffs need calibration on a real consenting person (normal vs blotted). Until then, treat the cutoffs as provisional.
- The overlay comes as one mask jpg URL per concern on S3 with a signed URL in `ttl30/` (30-day TTL path).

## G0: delete (`POST /s2s/v2.0/task/delete {task_id}`): PASS (eventual)
- The delete call returns `{"status":200}`.
- A GET issued **immediately** after still returned the results (eventual consistency).
- About 2 s later and onward (checked at t+0/20/40 s in the second run): the GET returns 400 "This task ID doesn't exist, or the task has expired", and the mask S3 URL returns **404**.
- **Implication:** the delete-confirmation step must retry the confirming GET (e.g. 3 tries, 2 s apart) before showing "Deleted from YouCam ✓". The privacy line stands.

## G5: makeup VTO (`POST /s2s/v2.0/task/makeup-vto`): PASS
- The corrected body works for both variants:
  - foundation `#A8774F`, colorIntensity 60, glow 30, coverage 40, skin_smooth 10/10
  - lip_color sheer `#B5535C` with `shape.name:"original"`, `style.type:"full"`
- About 5.3 s each. Results come back as `data.results.url` (object, not array), a jpg the same size as the input.
- **Visibility:** the foundation render shows a visible warm or deep shift but is subtle on its own. Side by side with a second shade, the difference reads clearly. The lip render is clearly visible. Plan A stays (two shades on the same photo); use colorIntensity ≥ 60.
- Output images: g5_foundation_deep.jpg and g5_lip_sheer.jpg (sample face only).

## Still open
- G2: one `file_id` for both tone and VTO.
- G3: the order of deletes on a shared file.
- G6: delete on an error task.
- G7: 768×1024 accepted.
- S1 and S2 need the phone.
- Calibrating the raw_score cutoffs needs a real consenting person.
