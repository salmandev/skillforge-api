export interface SecurityFlag {
  severity: 'critical' | 'high' | 'medium';
  type: string;
  description: string;
}

export interface SecurityScanResult {
  score: number;
  flags: SecurityFlag[];
}

export const scanSkillContent = (content: string): SecurityScanResult => {
  const flags: SecurityFlag[] = [];
  const normalizedContent = content.toLowerCase();

  // Critical patterns (-30 each)
  const criticalPatterns = [
    { pattern: /ignore previous instructions/gi, type: 'prompt_injection', description: 'Attempt to override system instructions' },
    { pattern: /disregard your/gi, type: 'prompt_injection', description: 'Attempt to disregard system rules' },
    { pattern: /forget your system prompt/gi, type: 'prompt_injection', description: 'Attempt to erase system prompt' },
    { pattern: /you are now/gi, type: 'persona_override', description: 'Persona override attempt' },
    { pattern: /new persona/gi, type: 'persona_override', description: 'New persona injection' },
    { pattern: /send to http/gi, type: 'data_exfiltration', description: 'Potential data exfiltration via HTTP' },
    { pattern: /post to external/gi, type: 'data_exfiltration', description: 'External POST request detected' },
    { pattern: /upload to http/gi, type: 'data_exfiltration', description: 'Upload to external URL' },
    { pattern: /exfiltrate/gi, type: 'data_exfiltration', description: 'Explicit data exfiltration mention' },
    { pattern: /\bsudo\b/gi, type: 'privilege_escalation', description: 'Sudo command detected' },
    { pattern: /rm -rf/gi, type: 'destructive_command', description: 'Destructive rm -rf command' },
    { pattern: /drop table/gi, type: 'destructive_command', description: 'SQL DROP TABLE command' },
    { pattern: /delete from/gi, type: 'destructive_command', description: 'SQL DELETE command' },
    { pattern: /truncate/gi, type: 'destructive_command', description: 'SQL TRUNCATE command' },
  ];

  // High patterns (-15 each)
  const highPatterns = [
    { pattern: /[A-Za-z0-9+/]{40,}={0,2}/g, type: 'obfuscated_content', description: 'Potential base64 encoded content' },
    { pattern: /\\u200e|\\u200f|\\u202a|\\u202b|\\u202c|\\u202d|\\u202e/g, type: 'unicode_override', description: 'Unicode direction override characters' },
    { pattern: /full access/gi, type: 'excessive_permissions', description: 'Requesting full access' },
    { pattern: /unrestricted/gi, type: 'excessive_permissions', description: 'Requesting unrestricted access' },
    { pattern: /bypass all/gi, type: 'excessive_permissions', description: 'Attempt to bypass security' },
  ];

  // Medium patterns (-5 each)
  const mediumPatterns = [
    { pattern: /(key|token|secret|api_key|apikey)\s*[=:]\s*[A-Za-z0-9_-]{20,}/gi, type: 'hardcoded_credentials', description: 'Potential hardcoded credentials' },
    { pattern: /https?:\/\/[^\s]+\?[^\s]+/g, type: 'external_url_params', description: 'External URL with query parameters' },
  ];

  // Check critical patterns
  criticalPatterns.forEach(({ pattern, type, description }) => {
    if (pattern.test(normalizedContent) || pattern.test(content)) {
      flags.push({ severity: 'critical', type, description });
    }
  });

  // Check high patterns
  highPatterns.forEach(({ pattern, type, description }) => {
    if (pattern.test(content)) {
      flags.push({ severity: 'high', type, description });
    }
  });

  // Check medium patterns
  mediumPatterns.forEach(({ pattern, type, description }) => {
    if (pattern.test(content)) {
      flags.push({ severity: 'medium', type, description });
    }
  });

  // Calculate score
  let score = 100;
  flags.forEach(flag => {
    if (flag.severity === 'critical') score -= 30;
    else if (flag.severity === 'high') score -= 15;
    else if (flag.severity === 'medium') score -= 5;
  });

  score = Math.max(0, score);

  return { score, flags };
};
