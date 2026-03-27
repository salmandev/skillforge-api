export interface PlatformFlags {
  claude: boolean;
  gpt: boolean;
  gemini: boolean;
  qwen: boolean;
  cursor: boolean;
  codex: boolean;
}

export const checkPlatformCompatibility = (
  content: string,
  platforms: string[]
): Record<string, boolean> => {
  const compatibility: Record<string, boolean> = {};
  const normalizedContent = content.toLowerCase();

  const platformIndicators: Record<string, RegExp[]> = {
    claude: [
      /claude/gi,
      /anthropic/gi,
      /<anthropic>/gi,
    ],
    gpt: [
      /gpt/gi,
      /chatgpt/gi,
      /openai/gi,
      /gpt-4/gi,
      /gpt-3\.5/gi,
    ],
    gemini: [
      /gemini/gi,
      /google ai/gi,
      /bard/gi,
    ],
    qwen: [
      /qwen/gi,
      /alibaba/gi,
      /tongyi/gi,
    ],
    cursor: [
      /cursor/gi,
      /cursor ide/gi,
    ],
    codex: [
      /codex/gi,
      /github copilot/gi,
    ],
  };

  platforms.forEach(platform => {
    const indicators = platformIndicators[platform.toLowerCase()];
    if (indicators) {
      compatibility[platform] = indicators.some(pattern => pattern.test(normalizedContent));
    } else {
      compatibility[platform] = false;
    }
  });

  return compatibility;
};

export const getDefaultPlatformFlags = (): PlatformFlags => ({
  claude: false,
  gpt: false,
  gemini: false,
  qwen: false,
  cursor: false,
  codex: false,
});
