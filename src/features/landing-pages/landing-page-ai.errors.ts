export function getLandingPageAiErrorMessage(errorMessage: string | null | undefined): string {
  if (!errorMessage) return 'A geracao falhou. Tente novamente em alguns minutos.';

  const normalized = errorMessage.toLowerCase();

  if (normalized.includes('insufficient_quota') || normalized.includes('exceeded your current quota')) {
    return 'A IA esta sem quota disponivel no momento. Verifique billing/creditos da OpenAI e tente novamente.';
  }

  if (normalized.includes('openai_api_key') || normalized.includes('ia nao configurada')) {
    return 'A IA ainda nao esta configurada para este ambiente.';
  }

  if (normalized.includes('briefing')) {
    return errorMessage;
  }

  return 'Nao foi possivel gerar o conteudo com IA agora. Tente novamente em alguns minutos.';
}

export function shouldShowLandingPageAiTechnicalDetails(errorMessage: string | null | undefined): boolean {
  if (!errorMessage) return false;
  return errorMessage.includes('{') || errorMessage.length > 180;
}
