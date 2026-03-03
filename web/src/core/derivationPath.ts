export type ParsedDerivationSegment = {
  depth: number;
  index: number;
  hardened: boolean;
  raw: string;
};

export type DerivationPathValidationSuccess = {
  ok: true;
  normalizedPath: string;
  depth: number;
  segments: ParsedDerivationSegment[];
};

export type DerivationPathValidationFailure = {
  ok: false;
  error: string;
};

export type DerivationPathValidationResult =
  | DerivationPathValidationSuccess
  | DerivationPathValidationFailure;

export type DerivationPathValidationOptions = {
  maxDepth?: number;
  maxIndex?: number;
};

const DEFAULT_MAX_DEPTH = 255;
const DEFAULT_MAX_INDEX = 0x7fffffff;
const SEGMENT_PATTERN = /^([0-9]+)(['hH])?$/;

export function validateDerivationPath(
  path: string,
  options: DerivationPathValidationOptions = {},
): DerivationPathValidationResult {
  const normalized = path.trim();
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxIndex = options.maxIndex ?? DEFAULT_MAX_INDEX;

  if (!normalized) {
    return fail("Caminho de derivação vazio.");
  }
  if (normalized[0] !== "m") {
    return fail("Primeiro caractere do caminho deve ser 'm'.");
  }
  if (normalized.length > 1 && normalized[1] !== "/") {
    return fail("Separador inválido após 'm'. Use '/'.");
  }

  const parts = normalized.split("/");
  const depth = parts.length - 1;
  if (depth > maxDepth) {
    return fail(`Profundidade ${depth} excede o máximo ${maxDepth}.`);
  }

  const segments: ParsedDerivationSegment[] = [];
  for (let index = 1; index < parts.length; index += 1) {
    const rawSegment = parts[index];
    const match = SEGMENT_PATTERN.exec(rawSegment);
    if (!match) {
      return fail(`Segmento inválido na profundidade ${index}: "${rawSegment}".`);
    }

    const numericPart = match[1];
    if (numericPart === undefined) {
      return fail(`Número ausente na profundidade ${index}.`);
    }
    const value = Number(numericPart);
    if (!Number.isSafeInteger(value)) {
      return fail(
        `Número fora do intervalo seguro em profundidade ${index}: ${numericPart}.`,
      );
    }
    if (value < 0 || value > maxIndex) {
      return fail(
        `Índice ${value} inválido em profundidade ${index}. Use 0..${maxIndex}.`,
      );
    }

    segments.push({
      depth: index,
      index: value,
      hardened: Boolean(match[2]),
      raw: rawSegment,
    });
  }

  return {
    ok: true,
    normalizedPath: normalized,
    depth,
    segments,
  };
}

export function validateXpubDerivationPath(
  path: string,
  isXpub: boolean,
  useHardenedAddresses: boolean,
): DerivationPathValidationResult {
  const pathValidation = validateDerivationPath(path);
  if (!pathValidation.ok) {
    return pathValidation;
  }
  if (!isXpub) {
    return pathValidation;
  }

  const hasHardenedInPath = pathValidation.segments.some((segment) => segment.hardened);
  if (hasHardenedInPath || useHardenedAddresses) {
    return fail("Caminho hardened é inválido ao derivar a partir de xpub.");
  }
  return pathValidation;
}

function fail(error: string): DerivationPathValidationFailure {
  return { ok: false, error };
}
