---
version: beta
name: Kinetic-Hybrid-Fitness-Design-System
description: "Un sistema di design a doppio stato (Dual-State)[cite: 1] e a doppio tema (Light/Dark). Mantiene il rigore analitico per i log (Reflection) e l'energia visiva per gli allenamenti (Action)[cite: 1], introducendo un tema Light 'Clinical Track' per la massima leggibilità diurna all'aperto, contrapposto al tema Dark 'Midnight Cyber' originale[cite: 1]."

colors:
  dark:
    primary: "#00E5FF" # Cyber Cyan - Per stati attivi e in allenamento[cite: 1]
    primary-hover: "#5CEBFF"[cite: 1]
    primary-focus: "#00E5FF"[cite: 1]
    secondary: "#951DD1" # Cyberpunk Purple - Per traguardi[cite: 1]
    ink: "#F8F2FC" # Premium Pearl[cite: 1]
    ink-muted: "#d0d6e0"[cite: 1]
    ink-subtle: "#8a8f98"[cite: 1]
    canvas: "#010102" # Near-Black puro (Linear)[cite: 1]
    surface-1: "#0f1011" # Flat grigio scuro[cite: 1]
    surface-2: "#141516"[cite: 1]
    surface-3: "#1d0c29"[cite: 1]
    hairline: "#23252a"[cite: 1]
    hairline-strong: "#00E5FF"[cite: 1]
    semantic-success: "#00E5FF"[cite: 1]
    semantic-overlay: "#010102"[cite: 1]
  
  light:
    primary: "#0088AA" # Ciano scuro per mantenere contrasto su bianco
    primary-hover: "#00AACC"
    primary-focus: "#0088AA"
    secondary: "#7F10B5" # Viola scuro ad alta leggibilità
    ink: "#010102" # Near-Black puro per il testo
    ink-muted: "#4B5563"
    ink-subtle: "#9CA3AF"
    canvas: "#F7F8F9" # Grigio perla freddo, non bianco puro per non affaticare gli occhi
    surface-1: "#FFFFFF" # Bianco puro per far risaltare le card dati
    surface-2: "#F3F4F6"
    surface-3: "#EBEAFA" # Leggerissimo accento lavanda
    hairline: "#E5E7EB" # Bordo tecnico grigio chiaro
    hairline-strong: "#0088AA" 
    semantic-success: "#0088AA"
    semantic-overlay: "#FFFFFF"

typography:
  display-xl:
    fontFamily: Linear Display[cite: 1]
    fontSize: 100px[cite: 1]
    fontWeight: 700[cite: 1]
    lineHeight: 1.0[cite: 1]
    letterSpacing: -4.0px[cite: 1]
  display-lg:
    fontFamily: Linear Display[cite: 1]
    fontSize: 56px[cite: 1]
    fontWeight: 600[cite: 1]
    lineHeight: 1.10[cite: 1]
    letterSpacing: -1.8px[cite: 1]
  display-md:
    fontFamily: Linear Display[cite: 1]
    fontSize: 40px[cite: 1]
    fontWeight: 600[cite: 1]
    lineHeight: 1.15[cite: 1]
    letterSpacing: -1.0px[cite: 1]
  headline:
    fontFamily: Linear Display[cite: 1]
    fontSize: 28px[cite: 1]
    fontWeight: 600[cite: 1]
    lineHeight: 1.20[cite: 1]
    letterSpacing: -0.6px[cite: 1]
  card-title:
    fontFamily: Linear Display[cite: 1]
    fontSize: 22px[cite: 1]
    fontWeight: 500[cite: 1]
    lineHeight: 1.25[cite: 1]
    letterSpacing: -0.4px[cite: 1]
  body:
    fontFamily: Linear Text[cite: 1]
    fontSize: 16px[cite: 1]
    fontWeight: 400[cite: 1]
    lineHeight: 1.50[cite: 1]
    letterSpacing: -0.05px[cite: 1]
  caption:
    fontFamily: Linear Text[cite: 1]
    fontSize: 12px[cite: 1]
    fontWeight: 400[cite: 1]
    lineHeight: 1.40[cite: 1]
    letterSpacing: 0[cite: 1]
  mono:
    fontFamily: Linear Mono[cite: 1]
    fontSize: 13px[cite: 1]
    fontWeight: 400[cite: 1]
    lineHeight: 1.50[cite: 1]
    letterSpacing: 0[cite: 1]

rounded:
  xs: 4px[cite: 1]
  sm: 6px[cite: 1]
  md: 8px[cite: 1]
  lg: 12px[cite: 1]
  xl: 16px[cite: 1]
  pill: 9999px[cite: 1]
  full: 9999px[cite: 1]

spacing:
  xs: 8px[cite: 1]
  sm: 12px[cite: 1]
  md: 16px[cite: 1]
  lg: 24px[cite: 1]
  xl: 32px[cite: 1]
  xxl: 48px[cite: 1]
  section: 96px[cite: 1]

components:
  live-metric-card:
    backgroundColor: "{colors.canvas}"[cite: 1]
    textColor: "{colors.ink}"[cite: 1]
    typography: "{typography.display-xl}"[cite: 1]
    rounded: "{rounded.xl}"[cite: 1]
    border: "2px solid {colors.hairline-strong}" # Aumentato a 2px per maggiore visibilità diurna in Light Mode
    padding: 32px[cite: 1]
  analytics-log-row:
    backgroundColor: "{colors.surface-1}"[cite: 1]
    textColor: "{colors.ink-muted}"[cite: 1]
    typography: "{typography.mono}"[cite: 1]
    rounded: "{rounded.xs}"[cite: 1]
    borderBottom: "1px solid {colors.hairline}"[cite: 1]
    padding: 12px 16px[cite: 1]
  button-action-live:
    backgroundColor: "{colors.primary}"[cite: 1]
    textColor: "{colors.canvas}"[cite: 1]
    typography: "{typography.headline}"[cite: 1]
    rounded: "{rounded.pill}"[cite: 1]
    padding: 24px 48px[cite: 1]
  button-secondary-log:
    backgroundColor: "{colors.surface-2}"[cite: 1]
    textColor: "{colors.ink-muted}"[cite: 1]
    typography: "{typography.button}"[cite: 1]
    rounded: "{rounded.md}"[cite: 1]
    padding: 8px 14px[cite: 1]
---

## Overview

Il sistema "Kinetic Hybrid" supporta nativamente due temi cromatici (Light/Dark) per adattarsi alle condizioni ambientali dell'utente (es. corsa all'aperto sotto il sole vs. palestra serale).

**I due temi:**
- **Tema Dark (Midnight Cyber):** Il canvas nero assorbe la luce e fa risaltare i neon[cite: 1]. Ideale per allenamenti indoor o per non affaticare la vista durante l'analisi serale dei dati.
- **Tema Light (Clinical Track):** Usa un grigio perla freddo (Canvas) con card bianco puro (Surface-1). I colori d'accento (Ciano e Viola) sono stati scuriti per garantire un contrasto WCAG AAA sui fondi chiari, mantenendo un aspetto "medico/prestazionale".

## L'Architettura a Doppio Stato e Tema

### 1. Modalità Azione (Live Workout)
- **In Dark Mode:** Dominano i bagliori cromatici sui bordi[cite: 1] per simulare schermi LED sportivi. Testo bianco perla su fondo nero[cite: 1].
- **In Light Mode:** Il bagliore viene sostituito da bordi netti e spessi (2px) in Ciano o Viola scuro. Il testo è nero inchiostro, massimizzando la leggibilità all'aperto (es. ciclismo o corsa su pista).

### 2. Modalità Riflessione (Log & Analytics)
- **In Dark Mode:** Superfici piatte antracite[cite: 1], bordi finissimi, zero distrazioni luminose.
- **In Light Mode:** Assomiglia a un cruscotto ospedaliero o a un foglio di calcolo pulito. Card bianche con bordi grigio chiaro (`#E5E7EB`), font monospaziato `Linear Mono`[cite: 1] e testi grigio ardesia scuro (`#4B5563`).

## Do's and Don'ts per il Tema Chiaro

### Do
- **Usa le varianti scure per gli accenti in Light Mode:** Usa `#0088AA` invece di `#00E5FF` sul bianco, altrimenti il Ciano brillante risulterà illeggibile e abbagliante.
- **Mantieni i log come "fogli di calcolo":** Nel tema chiaro, il log analitico deve sembrare carta stampata ad alta precisione.
- **Sfrutta le ombre (solo in Light Mode):** Mentre il Dark Mode usa i bordi luminosi per separare le card[cite: 1], il Light Mode può usare un'ombra lievissima (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)`) per sollevare le `surface-1` bianche dal `canvas` grigio chiaro.

### Don't
- **Non usare testo grigio chiaro sul bianco:** Assicurati che le metriche live siano nere assolute (`#010102`) per resistere ai riflessi del sole.
- **Non invertire indiscriminatamente i colori:** Il `button-action-live` in Dark Mode ha testo nero su fondo Ciano neon; in Light Mode deve avere testo bianco su fondo Ciano scuro.