# useCycle — Calculation Reference

## Data sources

| Field | Type | Description |
|---|---|---|
| `cycleSettings.lastPeriodStart` | `string \| null` | ISO date (YYYY-MM-DD) of the most recent period start. Anchor for all predictions. |
| `cycleSettings.cycleLength` | `number` | Average days between periods. Default 28, range 21–35. |
| `cycleSettings.periodLength` | `number` | Average days of flow. Default 5, range 2–10. |
| `cycleLogs` | `CycleLog[]` | Daily entries — flow level, mood, symptoms, BBT, note. |

---

## Calculations

### Day of Cycle — `getDayOfCycle(lastPeriodStart, today)`

```
dayOfCycle = (today − lastPeriodStart) in days + 1
```

Day 1 = the period start date itself. Returns `null` when no `lastPeriodStart` is set.

**Example:** `lastPeriodStart = 2026-05-01`, `today = 2026-05-08` → `dayOfCycle = 8`

---

### Normalised Day — wraps across multiple cycles

```
normalisedDay = ((dayOfCycle − 1) % cycleLength) + 1
```

If the user hasn't updated `lastPeriodStart` across multiple cycles, `dayOfCycle` keeps growing. Normalising it wraps the value back into `[1, cycleLength]` so phase detection stays correct.

**Example:** `cycleLength = 28`, `dayOfCycle = 56`
→ `((56−1) % 28) + 1 = (55 % 28) + 1 = 27 + 1 = 28`

---

### Phase Detection — `getCurrentPhase(normalisedDay, periodLength, cycleLength)`

The **luteal phase** is biologically fixed at ~14 days before the next period. This anchors ovulation at `cycleLength − 14`.

| Phase | Range |
|---|---|
| **Menstrual** | day 1 → `periodLength` |
| **Follicular** | `periodLength + 1` → `ovulationDay − 2` |
| **Ovulation** | `ovulationDay − 1` → `ovulationDay + 1` (±1 day window) |
| **Luteal** | `ovulationDay + 2` → `cycleLength` |

Where `ovulationDay = cycleLength − 14`.

**Example for 28-day cycle, 5-day period:**
- Menstrual: days 1–5
- Follicular: days 6–12
- Ovulation: days 13–15 (ovulationDay = 14 ± 1)
- Luteal: days 16–28

---

### Ovulation Date — `getOvulationDate(lastPeriodStart, cycleLength)`

```
ovulationDate = lastPeriodStart + (cycleLength − 14) days
```

Luteal phase duration is nearly always 14 days regardless of cycle length. So ovulation is calculated backwards from the predicted next period.

**Example:** `lastPeriodStart = 2026-06-01`, `cycleLength = 28` → `ovulationDate = 2026-06-15`

---

### Fertile Window — `getFertileWindow(ovulationDate)`

```
fertileStart = ovulationDate − 5 days
fertileEnd   = ovulationDate + 1 day
```

A 6-day window based on sperm viability (up to 5 days) and egg viability (12–24 hours after ovulation).

---

### Next Period Date — `getNextPeriodDate(lastPeriodStart, cycleLength)`

```
nextPeriodDate = lastPeriodStart + cycleLength days
```

---

### Cycle Progress (0–1 for ring animation)

```
cycleProgress = (normalisedDay − 1) / cycleLength
```

`0.0` = first day of cycle (period starts), `1.0` = last day (period due tomorrow). Drives the `PhaseOrb` ring.

---

## Calendar coloring rules

Phase colours are **prediction-based** — derived from `lastPeriodStart` even if no log exists for a date.

| Date type | Phase background shown? |
|---|---|
| Past date **with** a log | Yes — shows the predicted phase tint for that day |
| Past date **without** a log | No — deleting a log clears its colour |
| Today / future date | Yes — shows predictions regardless of log status |

Additional indicators per date:
- **Period ring** (red circle outline) — only if `log.flow` is set
- **Symptom dot** (small filled dot) — only if `log.symptoms.length > 0`
- **Ovulation circle** (purple) — on the predicted ovulation date
- **Fertile underline** (purple bar) — on dates in the fertile window
- **Today ring** (lime) — always on today's date

---

## Hook return shape

```ts
interface CycleResult {
  // Raw data
  cycleLogs:        CycleLog[];
  cycleSettings:    CycleSettings;

  // Computed
  todayStr:         string;            // YYYY-MM-DD
  dayOfCycle:       number | null;     // normalised, null if no lastPeriodStart
  currentPhase:     CyclePhase | null;
  phaseMeta:        PhaseMeta | null;  // label, emoji, color, tip
  cycleProgress:    number;            // 0–1 for ring

  nextPeriodDate:   string | null;
  daysUntilPeriod:  number | null;     // negative = overdue
  ovulationDate:    string | null;
  fertileStart:     string | null;
  fertileEnd:       string | null;
  inFertileWindow:  boolean;

  todayLog:         CycleLog | null;

  // Actions
  addCycleLog(log: Omit<CycleLog, 'id'>): void;
  updateCycleLog(id: string, patch: Partial<CycleLog>): void;
  deleteCycleLog(id: string): void;
  updateCycleSettings(patch: Partial<CycleSettings>): void;
  markPeriodStart(date?: string): void; // defaults to today; auto-adds a flow log
}
```

---

## markPeriodStart behaviour

```ts
markPeriodStart(date = todayStr) {
  updateCycleSettings({ lastPeriodStart: date });
  if (!cycleLogs.find(l => l.date === date)) {
    addCycleLog({ date, flow: 'medium', ... });
  }
}
```

Sets the new cycle anchor AND ensures a log exists for that date so the period ring appears in the calendar.

---

## Undo / date deselection

Tapping a calendar date when the inline detail panel is already open for **the same date** closes it (toggle behaviour). Tapping the `×` in the panel also closes it. Tapping a different coloured date while a panel is open switches to that date.
