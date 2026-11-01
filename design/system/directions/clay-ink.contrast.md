Script: /tmp/claude-1000/-home-aman-youcam/b17a1183-f92a-43c4-ae32-dde9d5f45f9f/scratchpad/contrast.py. It uses the WCAG 2.1 relative-luminance formula and reads tokens.json. Body text must reach 4.5:1. Non-text items (icons, focus ring, outlines, button fills, band ticks) must reach 3:1. Decorative hairline borders are left out under SC 1.4.11. 86 gated pairs, 0 failures.

Changes made while iterating: border-strong was #B6A994 in light and #5A5043 in dark, reaching only 1.8-2.4:1. I changed it to #7E725F (light) and #807464 (dark). The focus ring is drawn with a 2dp offset over the background, so it is measured against the backgrounds, not the accent fill.

| Mode | Foreground | Background | FG | BG | Use | Ratio | Min | Pass |
|---|---|---|---|---|---|---|---|---|
| light | text | bg | #1E1C19 | #F3EEE6 | body | 14.72:1 | 4.5:1 | PASS |
| light | text-muted | bg | #655B4D | #F3EEE6 | body | 5.76:1 | 4.5:1 | PASS |
| light | accent-text (links) | bg | #253D41 | #F3EEE6 | body | 9.98:1 | 4.5:1 | PASS |
| light | focus-ring | bg | #43666A | #F3EEE6 | non-text | 5.43:1 | 3.0:1 | PASS |
| light | border-strong | bg | #7E725F | #F3EEE6 | non-text | 4.08:1 | 3.0:1 | PASS |
| light | text | surface | #1E1C19 | #FAF7F2 | body | 15.91:1 | 4.5:1 | PASS |
| light | text-muted | surface | #655B4D | #FAF7F2 | body | 6.22:1 | 4.5:1 | PASS |
| light | accent-text (links) | surface | #253D41 | #FAF7F2 | body | 10.78:1 | 4.5:1 | PASS |
| light | focus-ring | surface | #43666A | #FAF7F2 | non-text | 5.87:1 | 3.0:1 | PASS |
| light | border-strong | surface | #7E725F | #FAF7F2 | non-text | 4.41:1 | 3.0:1 | PASS |
| light | text | surface-raised | #1E1C19 | #FFFCF7 | body | 16.61:1 | 4.5:1 | PASS |
| light | text-muted | surface-raised | #655B4D | #FFFCF7 | body | 6.50:1 | 4.5:1 | PASS |
| light | accent-text (links) | surface-raised | #253D41 | #FFFCF7 | body | 11.26:1 | 4.5:1 | PASS |
| light | focus-ring | surface-raised | #43666A | #FFFCF7 | non-text | 6.13:1 | 3.0:1 | PASS |
| light | border-strong | surface-raised | #7E725F | #FFFCF7 | non-text | 4.60:1 | 3.0:1 | PASS |
| light | text | surface-sunken | #1E1C19 | #EAE3D8 | body | 13.34:1 | 4.5:1 | PASS |
| light | text-muted | surface-sunken | #655B4D | #EAE3D8 | body | 5.22:1 | 4.5:1 | PASS |
| light | accent-text (links) | surface-sunken | #253D41 | #EAE3D8 | body | 9.04:1 | 4.5:1 | PASS |
| light | focus-ring | surface-sunken | #43666A | #EAE3D8 | non-text | 4.92:1 | 3.0:1 | PASS |
| light | border-strong | surface-sunken | #7E725F | #EAE3D8 | non-text | 3.70:1 | 3.0:1 | PASS |
| light | on-accent | accent | #F6F1E8 | #1B2F32 | body | 12.45:1 | 4.5:1 | PASS |
| light | accent (button fill) | bg | #1B2F32 | #F3EEE6 | non-text | 12.13:1 | 3.0:1 | PASS |
| light | accent (button fill) | surface-raised | #1B2F32 | #FFFCF7 | non-text | 13.69:1 | 3.0:1 | PASS |
| light | chip-fg | chip-bg | #2B2722 | #EAE3D8 | body | 11.64:1 | 4.5:1 | PASS |
| light | text-muted | chip-bg | #655B4D | #EAE3D8 | body | 5.22:1 | 4.5:1 | PASS |
| light | band tick empty | chip-bg | #7E725F | #EAE3D8 | non-text | 3.70:1 | 3.0:1 | PASS |
| light | band tick filled | chip-bg | #2B2722 | #EAE3D8 | non-text | 11.64:1 | 3.0:1 | PASS |
| light | fits.fg | fits.bg | #34492A | #E5EBDD | body | 8.09:1 | 4.5:1 | PASS |
| light | fits.fg (icon/label) | surface | #34492A | #FAF7F2 | body | 9.22:1 | 4.5:1 | PASS |
| light | text | fits.bg | #1E1C19 | #E5EBDD | body | 13.97:1 | 4.5:1 | PASS |
| light | text-muted | fits.bg | #655B4D | #E5EBDD | body | 5.47:1 | 4.5:1 | PASS |
| light | caution.fg | caution.bg | #62410A | #F3E6CC | body | 7.46:1 | 4.5:1 | PASS |
| light | caution.fg (icon/label) | surface | #62410A | #FAF7F2 | body | 8.62:1 | 4.5:1 | PASS |
| light | text | caution.bg | #1E1C19 | #F3E6CC | body | 13.76:1 | 4.5:1 | PASS |
| light | text-muted | caution.bg | #655B4D | #F3E6CC | body | 5.39:1 | 4.5:1 | PASS |
| light | unknown.fg | unknown.bg | #3B464D | #E6E8E8 | body | 7.87:1 | 4.5:1 | PASS |
| light | unknown.fg (icon/label) | surface | #3B464D | #FAF7F2 | body | 9.06:1 | 4.5:1 | PASS |
| light | text | unknown.bg | #1E1C19 | #E6E8E8 | body | 13.82:1 | 4.5:1 | PASS |
| light | text-muted | unknown.bg | #655B4D | #E6E8E8 | body | 5.41:1 | 4.5:1 | PASS |
| light | medicine.fg | medicine.bg | #1E1C19 | #EFEBE4 | body | 14.31:1 | 4.5:1 | PASS |
| light | medicine.fg (icon/label) | surface | #1E1C19 | #FAF7F2 | body | 15.91:1 | 4.5:1 | PASS |
| light | text | medicine.bg | #1E1C19 | #EFEBE4 | body | 14.31:1 | 4.5:1 | PASS |
| light | text-muted | medicine.bg | #655B4D | #EFEBE4 | body | 5.60:1 | 4.5:1 | PASS |
| dark | text | bg | #F1EBE1 | #151411 | body | 15.54:1 | 4.5:1 | PASS |
| dark | text-muted | bg | #B0A595 | #151411 | body | 7.60:1 | 4.5:1 | PASS |
| dark | accent-text (links) | bg | #B0C5C7 | #151411 | body | 10.23:1 | 4.5:1 | PASS |
| dark | focus-ring | bg | #86A4A7 | #151411 | non-text | 6.91:1 | 3.0:1 | PASS |
| dark | border-strong | bg | #807464 | #151411 | non-text | 4.03:1 | 3.0:1 | PASS |
| dark | text | surface | #F1EBE1 | #1E1C18 | body | 14.35:1 | 4.5:1 | PASS |
| dark | text-muted | surface | #B0A595 | #1E1C18 | body | 7.02:1 | 4.5:1 | PASS |
| dark | accent-text (links) | surface | #B0C5C7 | #1E1C18 | body | 9.44:1 | 4.5:1 | PASS |
| dark | focus-ring | surface | #86A4A7 | #1E1C18 | non-text | 6.38:1 | 3.0:1 | PASS |
| dark | border-strong | surface | #807464 | #1E1C18 | non-text | 3.73:1 | 3.0:1 | PASS |
| dark | text | surface-raised | #F1EBE1 | #28251F | body | 12.88:1 | 4.5:1 | PASS |
| dark | text-muted | surface-raised | #B0A595 | #28251F | body | 6.30:1 | 4.5:1 | PASS |
| dark | accent-text (links) | surface-raised | #B0C5C7 | #28251F | body | 8.48:1 | 4.5:1 | PASS |
| dark | focus-ring | surface-raised | #86A4A7 | #28251F | non-text | 5.73:1 | 3.0:1 | PASS |
| dark | border-strong | surface-raised | #807464 | #28251F | non-text | 3.35:1 | 3.0:1 | PASS |
| dark | text | surface-sunken | #F1EBE1 | #100F0D | body | 16.16:1 | 4.5:1 | PASS |
| dark | text-muted | surface-sunken | #B0A595 | #100F0D | body | 7.90:1 | 4.5:1 | PASS |
| dark | accent-text (links) | surface-sunken | #B0C5C7 | #100F0D | body | 10.63:1 | 4.5:1 | PASS |
| dark | focus-ring | surface-sunken | #86A4A7 | #100F0D | non-text | 7.19:1 | 3.0:1 | PASS |
| dark | border-strong | surface-sunken | #807464 | #100F0D | non-text | 4.20:1 | 3.0:1 | PASS |
| dark | on-accent | accent | #0C171A | #B0C5C7 | body | 10.11:1 | 4.5:1 | PASS |
| dark | accent (button fill) | bg | #B0C5C7 | #151411 | non-text | 10.23:1 | 3.0:1 | PASS |
| dark | accent (button fill) | surface-raised | #B0C5C7 | #28251F | non-text | 8.48:1 | 3.0:1 | PASS |
| dark | chip-fg | chip-bg | #E8E0D4 | #2E2A24 | body | 10.89:1 | 4.5:1 | PASS |
| dark | text-muted | chip-bg | #B0A595 | #2E2A24 | body | 5.88:1 | 4.5:1 | PASS |
| dark | band tick empty | chip-bg | #807464 | #2E2A24 | non-text | 3.12:1 | 3.0:1 | PASS |
| dark | band tick filled | chip-bg | #E8E0D4 | #2E2A24 | non-text | 10.89:1 | 3.0:1 | PASS |
| dark | fits.fg | fits.bg | #B9CCA8 | #1E2A1A | body | 8.75:1 | 4.5:1 | PASS |
| dark | fits.fg (icon/label) | surface | #B9CCA8 | #1E1C18 | body | 9.94:1 | 4.5:1 | PASS |
| dark | text | fits.bg | #F1EBE1 | #1E2A1A | body | 12.64:1 | 4.5:1 | PASS |
| dark | text-muted | fits.bg | #B0A595 | #1E2A1A | body | 6.18:1 | 4.5:1 | PASS |
| dark | caution.fg | caution.bg | #E6C482 | #2D2313 | body | 9.24:1 | 4.5:1 | PASS |
| dark | caution.fg (icon/label) | surface | #E6C482 | #1E1C18 | body | 10.19:1 | 4.5:1 | PASS |
| dark | text | caution.bg | #F1EBE1 | #2D2313 | body | 13.01:1 | 4.5:1 | PASS |
| dark | text-muted | caution.bg | #B0A595 | #2D2313 | body | 6.36:1 | 4.5:1 | PASS |
| dark | unknown.fg | unknown.bg | #BCC5CA | #21262A | body | 8.71:1 | 4.5:1 | PASS |
| dark | unknown.fg (icon/label) | surface | #BCC5CA | #1E1C18 | body | 9.70:1 | 4.5:1 | PASS |
| dark | text | unknown.bg | #F1EBE1 | #21262A | body | 12.88:1 | 4.5:1 | PASS |
| dark | text-muted | unknown.bg | #B0A595 | #21262A | body | 6.30:1 | 4.5:1 | PASS |
| dark | medicine.fg | medicine.bg | #F1EBE1 | #211F1B | body | 13.87:1 | 4.5:1 | PASS |
| dark | medicine.fg (icon/label) | surface | #F1EBE1 | #1E1C18 | body | 14.35:1 | 4.5:1 | PASS |
| dark | text | medicine.bg | #F1EBE1 | #211F1B | body | 13.87:1 | 4.5:1 | PASS |
| dark | text-muted | medicine.bg | #B0A595 | #211F1B | body | 6.79:1 | 4.5:1 | PASS |