/**
 * Generatore della card condivisibile (Instagram/WhatsApp). Canvas 2D
 * nativo, nessuna dipendenza: profile.avatar è cross-origin e sporcherebbe
 * il canvas (toBlob() lancerebbe SecurityError), quindi qui non si disegna
 * mai un'immagine remota. File puro: nessun import di React/next/supabase.
 */

export const SHARE_W = 1080;
export const SHARE_H = 1350; // 4:5, formato feed Instagram

export interface ShareCardData {
  title: string; // es. "Push A" o "Club 100 kg"
  subtitle: string; // es. "Martedì 3 settembre"
  stats: { label: string; value: string }[]; // MAX 3, già formattati
  highlight?: string; // es. "Nuovo record: Panca 105 kg"
  userName: string;
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Va a capo su al massimo `maxLines` righe, troncando l'ultima con "…". */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let i = 0;

  while (i < words.length && lines.length < maxLines) {
    const word = words[i];
    const attempt = current ? `${current} ${word}` : word;
    // `!current` garantisce di consumare almeno una parola anche se da
    // sola eccede maxWidth (evita un loop infinito su parole lunghissime).
    if (ctx.measureText(attempt).width <= maxWidth || !current) {
      current = attempt;
      i += 1;
    } else {
      lines.push(current);
      current = "";
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
    current = "";
  }

  const truncated = i < words.length || current !== "";
  if (truncated && lines.length > 0) {
    let last = lines[lines.length - 1];
    let withEllipsis = `${last}…`;
    while (ctx.measureText(withEllipsis).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
      withEllipsis = `${last.trimEnd()}…`;
    }
    lines[lines.length - 1] = withEllipsis;
  }

  return lines;
}

export async function drawShareCard(data: ShareCardData): Promise<Blob> {
  // ALTRIMENTI il testo esce con il font di fallback.
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_W;
  canvas.height = SHARE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");

  // Sfondo: gradiente verticale
  const bg = ctx.createLinearGradient(0, 0, 0, SHARE_H);
  bg.addColorStop(0, "#FAF7F0");
  bg.addColorStop(1, "#E8F3EE");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);

  // Card interna bianca, inset 64px, raggio 48
  const inset = 64;
  const cardX = inset;
  const cardY = inset;
  const cardW = SHARE_W - inset * 2;
  const cardH = SHARE_H - inset * 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 48);
  ctx.fill();

  const padX = cardX + 72;
  const maxTextWidth = cardW - 144;
  let cursorY = cardY + 128;

  // Eyebrow
  ctx.fillStyle = "#0f766e";
  ctx.font = `bold 32px ${FONT}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("FITAPP", padX, cursorY);
  ctx.letterSpacing = "0px";

  // Title, wrap manuale a 2 righe max
  cursorY += 80;
  ctx.fillStyle = "#022c22";
  ctx.font = `bold 88px ${FONT}`;
  const titleLines = wrapText(ctx, data.title, maxTextWidth, 2);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, padX, cursorY + i * 96);
  });
  cursorY += (titleLines.length - 1) * 96 + 72;

  // Subtitle
  ctx.fillStyle = "rgba(6,78,59,0.6)";
  ctx.font = `36px ${FONT}`;
  ctx.fillText(data.subtitle, padX, cursorY);

  // Stats: fino a 3 riquadri affiancati
  const stats = data.stats.slice(0, 3);
  if (stats.length > 0) {
    cursorY += 96;
    const gap = 24;
    const boxW = (maxTextWidth - gap * (stats.length - 1)) / stats.length;
    const boxH = 220;

    ctx.textAlign = "center";
    stats.forEach((stat, i) => {
      const boxX = padX + i * (boxW + gap);
      ctx.fillStyle = "#FAF7F0";
      ctx.beginPath();
      ctx.roundRect(boxX, cursorY, boxW, boxH, 24);
      ctx.fill();

      ctx.fillStyle = "#022c22";
      ctx.font = `bold 56px ${FONT}`;
      ctx.fillText(stat.value, boxX + boxW / 2, cursorY + 108, boxW - 24);

      ctx.fillStyle = "rgba(6,78,59,0.5)";
      ctx.font = `bold 26px ${FONT}`;
      ctx.fillText(stat.label.toUpperCase(), boxX + boxW / 2, cursorY + 160, boxW - 24);
    });
    ctx.textAlign = "left";
    cursorY += boxH;
  }

  // Highlight (opzionale): pill ambrata
  if (data.highlight) {
    cursorY += 64;
    ctx.font = `bold 32px ${FONT}`;
    const pillPadX = 32;
    const pillH = 72;
    const textWidth = Math.min(ctx.measureText(data.highlight).width, maxTextWidth - pillPadX * 2);
    const pillW = textWidth + pillPadX * 2;

    ctx.fillStyle = "#FEF3C7";
    ctx.beginPath();
    ctx.roundRect(padX, cursorY, pillW, pillH, pillH / 2);
    ctx.fill();

    ctx.fillStyle = "#b45309";
    ctx.textBaseline = "middle";
    ctx.fillText(data.highlight, padX + pillPadX, cursorY + pillH / 2, pillW - pillPadX * 2);
    ctx.textBaseline = "alphabetic";
  }

  // Footer: nessuna immagine remota (profile.avatar è cross-origin: vedi
  // commento in testa al file). Solo il nome utente, in basso a sinistra.
  ctx.fillStyle = "rgba(6,78,59,0.4)";
  ctx.font = `30px ${FONT}`;
  ctx.fillText(`@${data.userName}`, padX, cardY + cardH - 56);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob fallito"))),
      "image/png"
    );
  });
}

/**
 * Condivide il blob via Web Share API (mobile) o lo scarica (fallback,
 * anche su desktop dove Web Share con file non esiste).
 */
export async function shareOrDownload(
  blob: Blob,
  filename: string
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (err) {
      // L'utente annulla il foglio di condivisione nativo → AbortError:
      // non è un errore da mostrare, e non si scarica nulla al suo posto.
      if (err instanceof DOMException && err.name === "AbortError") {
        return "downloaded";
      }
      throw err;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
