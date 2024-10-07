import fs from 'node:fs';
import path from 'node:path';
import { generateCode } from '@ton-community/tlb-codegen';

const inputDir = path.join(__dirname, '..', 'tlb');
const outputDir = path.join(__dirname, '..', 'abi');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const referenceComment = '/// <reference path="../global.d.ts" />\n\nimport { loadEither, storeEither } from "./helper";\n\n';

function addReferenceToFile(filePath: string) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  if (!content.includes(referenceComment)) {
    const updatedContent = referenceComment + content;
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Added reference to global.d.ts in ${filePath}`);
  } else {
    console.log(`Reference already exists in ${filePath}`);
  }
}

const files = fs.readdirSync(inputDir);

for (const file of files) {
  if (path.extname(file) === '.tlb') {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}.ts`);

    try {
      generateCode(inputPath, outputPath, 'typescript');
      console.log(`Generated TypeScript code for ${file}`);
      addReferenceToFile(outputPath);
    } catch (error) {
      console.error(`Error generating code for ${file}:`, error);
    }
  }
}

console.log('Code generation process completed.');
