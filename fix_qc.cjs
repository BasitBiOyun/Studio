const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'services', 'qualityChecker.ts');
let code = fs.readFileSync(file, 'utf8');

// Inject activeTemplate helper inside runDesignQualityCheck
code = code.replace(/export function runDesignQualityCheck\(project: Project\): QualityIssue\[\] \{/, 
`export function runDesignQualityCheck(project: Project): QualityIssue[] {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];`);

// Inject activeTemplate helper inside runDesignQualityAudit
code = code.replace(/export function runDesignQualityAudit\(project: Project\): QualityAuditResult \{/, 
`export function runDesignQualityAudit(project: Project): QualityAuditResult {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];`);

// Replacements
code = code.replace(/project\.player\?\.name/g, 'project.sharedData.player?.name');
code = code.replace(/project\.playerImageSrc/g, 'activeTemplate.visuals.playerImageSrc');
code = code.replace(/project\.imageTransform/g, 'activeTemplate.visuals.imageTransform');
code = code.replace(/project\.theme/g, 'activeTemplate.theme');
code = code.replace(/project\.stats/g, 'activeTemplate.content.stats');

fs.writeFileSync(file, code);
