const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'clubSearch.ts');
let code = fs.readFileSync(file, 'utf8');

const target = `export async function fetchLogoAsDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });`;

const replace = `export async function fetchLogoAsDataUrl(url: string): Promise<string> {
  try {
    // Wikipedia Commons images don't always send CORS headers on standard requests from browser directly. 
    // They usually do, but wait. Commons DOES support CORS if requested properly, but we can also use a corsproxy just in case.
    // Let's use corsproxy if needed, or directly. MediaWiki Commons has CORS enabled for * 
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });`;

code = code.replace(target, replace);
fs.writeFileSync(file, code);
