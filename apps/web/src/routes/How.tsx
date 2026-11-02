import { COPY } from '@skinkey/contracts';
import { Fragment, type ReactNode } from 'react';

type BoxProps = { x: number; y: number; w: number; h: number; title: string; lines?: string[]; kind?: 'box' | 'box-accent' | 'box-delete' };

function Box({ x, y, w, h, title, lines = [], kind = 'box' }: BoxProps) {
  return (
    <g>
      <rect className={kind} x={x} y={y} width={w} height={h} rx={8} />
      <text x={x + 14} y={y + 26} fontSize={15} fontWeight={600}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={x + 14} y={y + 48 + i * 19} fontSize={13} className="muted-text">
          {l}
        </text>
      ))}
    </g>
  );
}

function Arrow({ d, label, lx, ly, dashed }: { d: string; label?: string; lx?: number; ly?: number; dashed?: boolean }) {
  return (
    <g>
      <path className={dashed ? 'arrow-dash' : 'arrow'} d={d} markerEnd="url(#head)" />
      {label && (
        <text x={lx} y={ly} fontSize={12.5} className="muted-text">
          {label}
        </text>
      )}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" className="head" />
      </marker>
    </defs>
  );
}

function Architecture() {
  return (
    <svg className="diagram" viewBox="0 0 1000 470" role="img" aria-labelledby="arch-title arch-desc">
      <title id="arch-title">SkinKey architecture</title>
      <desc id="arch-desc">
        The Android app talks to a Cloudflare Worker that holds the keys. The Worker calls the YouCam API and Claude. The phone
        uploads the photo straight to a YouCam upload URL. The rules package runs on the phone and on this website.
      </desc>
      <Defs />
      <Box
        x={20}
        y={40}
        w={270}
        h={190}
        kind="box-accent"
        title="SkinKey app (Android)"
        lines={['Share sheet in, from store apps', 'Capture guide, 1080p short side', 'Key on the phone: bands, zones, date', 'Rules package: verdict + rank', 'Photo cache deleted after upload']}
      />
      <Box
        x={20}
        y={280}
        w={270}
        h={150}
        title="This website"
        lines={['Web check with a Demo Key', 'Same rules package, in the browser', '/rules and /audit from build files']}
      />
      <Box
        x={370}
        y={40}
        w={270}
        h={250}
        title="Cloudflare Worker"
        lines={[
          'Holds the YouCam and Anthropic keys',
          '250 requests / 300 s window',
          'At least 1.2 s between calls',
          'Idempotency keys on creates',
          'Unit ledger, checked against credit',
          'Caps: 1 scan, 3 try-ons per install',
          'Polls every task, then deletes it',
          'Mock YouCam for development and CI',
        ]}
      />
      <Box
        x={720}
        y={40}
        w={260}
        h={170}
        title="YouCam API (Perfect Corp)"
        lines={['Skin Analysis HD (v2.1)', 'Facial Color Tones', 'Makeup VTO', 'task/delete, credit, feature cost']}
      />
      <Box
        x={720}
        y={260}
        w={260}
        h={170}
        title="Claude Opus 5.5"
        lines={['X3: title or screenshot to catalogue ids', 'X4: label photo to ingredient names', 'Structured output, never a verdict']}
      />
      <Arrow d="M290 110 H366" label="API calls" lx={300} ly={100} />
      <Arrow d="M640 110 H716" label="Bearer key" lx={650} ly={100} />
      <Arrow d="M640 250 C 680 250, 680 330, 716 330" label="product text only" lx={600} ly={312} />
      <Arrow d="M155 40 C 155 0, 850 0, 850 36" dashed label="photo PUT straight to YouCam's upload URL" lx={360} ly={18} />
      <Arrow d="M290 340 C 330 340, 330 270, 366 270" dashed label="label photo, rules" lx={296} ly={366} />
    </svg>
  );
}

function Chain() {
  const col = (x: number, title: string, steps: { t: string; l: string[]; kind?: BoxProps['kind'] }[], units: string) => (
    <g>
      <text x={x} y={28} fontSize={16} fontWeight={600}>
        {title}
      </text>
      <text x={x} y={48} fontSize={13} className="muted-text">
        {units}
      </text>
      {steps.map((s, i) => (
        <Fragment key={s.t}>
          <Box x={x} y={66 + i * 112} w={440} h={88} title={s.t} lines={s.l} kind={s.kind} />
          {i < steps.length - 1 && <Arrow d={`M${x + 40} ${154 + i * 112} V${176 + i * 112}`} />}
        </Fragment>
      ))}
    </g>
  );
  return (
    <svg className="diagram" viewBox="0 0 1000 520" role="img" aria-labelledby="chain-title">
      <title id="chain-title">YouCam call chain for the Key scan and the tint try-on</title>
      <Defs />
      {col(
        20,
        'Key scan (once, at onboarding)',
        [
          { t: 'P1  POST /s2s/v2.0/file, then PUT', l: ['JPG, short side at least 1080 px. 0 units.', 'Phone deletes the capture right after the PUT.'] },
          { t: 'P2  POST /s2s/v2.1/task/skin-analysis', l: ['hd_skin_type, hd_oiliness, hd_moisture, hd_redness, hd_pore', 'enable_mask_overlay: true · format: "json" · 16 units'] },
          { t: 'P3  GET …/task/skin-analysis/{task_id}', l: ['Poll until terminal, at least one GET.', 'raw_score kept; ui_score dropped at the Worker.'] },
          { t: 'P4  POST /s2s/v2.0/task/delete', l: ['After the result is read. Removes the task,', 'its outputs and the uploaded input file.'], kind: 'box-delete' },
        ],
        '16 units per Key',
      )}
      {col(
        540,
        'Tint try-on (tinted products only)',
        [
          { t: 'T1  POST /s2s/v2.0/file, then PUT', l: ['Fresh selfie resized to 768 × 1024.', 'Separate try-on consent first.'] },
          { t: 'T2  POST /s2s/v2.0/task/skin-tone-analysis', l: ['Multi-shade only · 20 units. The tone picks two', 'candidate shades internally and is never shown.'] },
          { t: 'T3  POST /s2s/v2.0/task/makeup-vto  ×1–2', l: ['foundation or lip_color effect, version "1.0"', '1 unit per render · renders held in memory only'] },
          { t: 'T4  GET each task, then task/delete each', l: ['Every task on the file terminal and read,', 'then each one deleted.'], kind: 'box-delete' },
        ],
        '22 units for two shades, 1 unit for one',
      )}
    </svg>
  );
}

const STATES = ['uploaded', 'task_created', 'running', 'terminal', 'result_read', 'delete_requested', 'deleted'];

function DeleteMachine() {
  const w = 128;
  const gap = 12;
  return (
    <svg className="diagram" viewBox="0 0 1000 250" role="img" aria-labelledby="sm-title">
      <title id="sm-title">Delete state machine, one record per uploaded file</title>
      <Defs />
      {STATES.map((s, i) => {
        const x = 8 + i * (w + gap);
        return (
          <g key={s}>
            <rect className={s === 'deleted' ? 'box-delete' : 'box'} x={x} y={40} width={w} height={48} rx={8} />
            <text x={x + w / 2} y={69} fontSize={13} fontWeight={600} textAnchor="middle">
              {s.replace('_', ' ')}
            </text>
            {i < STATES.length - 1 && <path className="arrow" d={`M${x + w} 64 H${x + w + gap - 2}`} markerEnd="url(#head)" />}
          </g>
        );
      })}
      <rect className="box" x={8 + 6 * (w + gap)} y={150} width={w} height={48} rx={8} />
      <text x={8 + 6 * (w + gap) + w / 2} y={179} fontSize={13} fontWeight={600} textAnchor="middle">
        delete failed
      </text>
      <path className="arrow-dash" d={`M${8 + 5 * (w + gap) + w / 2} 88 V174 H${8 + 6 * (w + gap) - 2}`} markerEnd="url(#head)" />
      <rect className="box" x={8} y={150} width={w} height={48} rx={8} />
      <text x={8 + w / 2} y={179} fontSize={13} fontWeight={600} textAnchor="middle">
        orphan
      </text>
      <path className="arrow-dash" d={`M${8 + w / 2} 88 V146`} markerEnd="url(#head)" />
      <text x={8} y={225} fontSize={12.5} className="muted-text">
        Upload with no task (cancel, 400, quality fail)
      </text>
      <text x={8 + 4 * (w + gap)} y={225} fontSize={12.5} className="muted-text">
        Failure is shown, never hidden
      </text>
    </svg>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="page-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function How() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>How SkinKey is built.</h1>
        <p>
          Three YouCam features chained across onboarding and the share moment, a Worker that keeps the keys and deletes every
          task, Claude for reading only, and a rules package that makes every call the same way on the phone and here.
        </p>
      </div>

      <Section id="arch" title="Architecture">
        <Architecture />
      </Section>

      <Section id="chain" title="YouCam call chain">
        <p>
          Base URL https://yce-api-01.makeupar.com. The Bearer key lives only in the Worker. Unit costs are from the live
          feature-cost endpoint. Skincare checks reuse the readings stored on the phone, so most shares make no new face upload;
          that is a deliberate privacy choice.
        </p>
        <Chain />
      </Section>

      <Section id="delete" title="Delete state machine">
        <p>
          {COPY.privacyLine} {COPY.privacyQualifier}
        </p>
        <DeleteMachine />
        <ul className="stack small" style={{ marginTop: 8 }}>
          <li>
            <strong>Orphan upload:</strong> {COPY.orphanUpload}
          </li>
          <li>
            <strong>Delete failed:</strong> {COPY.deleteFailed}
          </li>
          <li>
            <strong>Tasks sharing a file:</strong> all finish, all results are read, then each task is deleted.
          </li>
        </ul>
      </Section>

      <Section id="keep" title="What is kept, and where">
        <div className="two-col">
          <div className="panel">
            <p className="ui-title">On the phone only</p>
            <ul className="stack" style={{ marginTop: 10 }}>
              <li>Skin-type reading and zone labels (zone labels only if gate G1 passes)</li>
              <li>Oiliness, moisture, redness and pore bands, each Low, Medium or High</li>
              <li>Scan date, and which bands you marked {COPY.selfReported}</li>
              <li>The tone value during a try-on, dropped when the sheet closes</li>
            </ul>
          </div>
          <div className="panel">
            <p className="ui-title">Never kept</p>
            <ul className="stack" style={{ marginTop: 10 }}>
              <li>Your photo: the capture is deleted after upload and the YouCam task is deleted after reading</li>
              <li>The YouCam result overlay and try-on renders: memory only, never written to disk</li>
              <li>Scores: bands only, from raw_score</li>
              <li>Face data together with product text: they never travel in the same request</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="claude" title="Claude reads. Rules decide.">
        <p>
          Claude Opus 5.5 is called with structured outputs and adaptive thinking. It proposes; a person or the rules decide.
          Verdict copy is never written by a model at runtime.
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Prompt</th>
                <th scope="col">Job</th>
                <th scope="col">Guard</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">X3 share resolver (runtime, effort low)</th>
                <td>Messy title, URL or cropped screenshot to catalogue ids only</td>
                <td>You confirm the product before any verdict. Below threshold: UNKNOWN. Never invents an ingredient list.</td>
              </tr>
              <tr>
                <th scope="row">X4 label reader (runtime, effort medium)</th>
                <td>Photo of an ingredient list to CosIng names</td>
                <td>Editable chips; uncertain names are outlined. You confirm, then the same rules run.</td>
              </tr>
              <tr>
                <th scope="row">X1, X2, X5 (offline)</th>
                <td>Catalogue extraction, verification packets, claim spans</td>
                <td>Two passes diffed. A brand-page row counts once a second, independent read matched it word for word (labelled “checked against the brand page”); rows a person has ticked are labelled human-checked. Retailer rows never count.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="unused" title="What we didn't use, and why">
        <ul className="stack">
          <li>
            <strong>Fitzpatrick:</strong> pushes toward medical framing and changes no rule.
          </li>
          <li>
            <strong>Skin and aging simulation:</strong> before/after pictures imply an effect we can't support.
          </li>
          <li>
            <strong>Face attributes:</strong> no rule uses them.
          </li>
          <li>
            <strong>Advanced skin report and product recommendation:</strong> we chose published, deterministic rules so every
            verdict can be audited.
          </li>
          <li>
            <strong>Mobile Camera Kit:</strong> no React Native SDK, so the app has its own capture guide.
          </li>
          <li>
            <strong>Webhooks:</strong> the Worker polls instead; every task gets at least one GET before it is deleted.
          </li>
        </ul>
      </Section>
    </div>
  );
}
