import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../.tmp-icons');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Create readline interface for prompts
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input with validation
 * @param {Object} config - Prompt configuration
 * @returns {Promise<string>}
 */
const prompt = async ({ question, validate }) => {
    const ask = () => new Promise((resolve) => rl.question(question, resolve));
    
    while (true) {
        const answer = await ask();
        if (!validate || validate(answer)) {
            return answer;
        }
        console.error('Invalid input. Please try again.');
    }
};

/**
 * Extract repository info from GitHub URL
 * @param {string} url
 * @returns {{ owner: string, repo: string, path: string }}
 */
function parseGitHubUrl(url) {
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+\/(.+))?/;
    const match = url.match(urlPattern);
    
    if (!match) {
        throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo/tree/branch/path');
    }
    
    return {
        owner: match[1],
        repo: match[2],
        path: match[3] || ''
    };
}

/**
 * Clone specific directory from GitHub repository
 * @param {string} url - GitHub repository URL
 * @returns {string} Path to cloned directory
 */
async function cloneGitHubDirectory(url) {
    const { owner, repo, path: repoPath } = parseGitHubUrl(url);
    
    // Clean up any existing temporary directory
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    console.log('Cloning repository...');
    execSync(`git clone --depth 1 https://github.com/${owner}/${repo}.git ${TEMP_DIR}`);

    const targetDir = path.join(TEMP_DIR, repoPath);
    if (!fs.existsSync(targetDir)) {
        throw new Error(`Directory ${repoPath} not found in repository`);
    }

    return targetDir;
}

/**
 * Update data file with new icons
 * @param {string} name - Icon set name
 * @param {Array} icons - Array of icon objects
 */
async function updateDataFile(name, icons) {
    const dataDir = path.join(__dirname, '../src/data');
    const dataFile = path.join(dataDir, `${name}.js`);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dataContent = `// Generated icons for ${name}
export const ${name}Icons = ${JSON.stringify(icons, null, 2)};
`;
    await fs.promises.writeFile(dataFile, dataContent);
    console.log(`✓ Updated data file: ${path.relative(process.cwd(), dataFile)}`);
}

/**
 * Update core icons file
 * @param {string} name - Icon set name
 * @param {string} label - Icon set label
 */
async function updateCoreIcons(name, label) {
    const iconDir = path.join(__dirname, '../src/core/icons');
    const iconFile = path.join(iconDir, `${name}.js`);

    // Ensure icons directory exists
    if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
    }

    const exportName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const content = `import { ${name}Icons } from '../../data/${name}';

/**
 * ${label} configuration
 */
export const ${exportName} = {
    name: '${name}',
    label: '${label}',
    icons: ${name}Icons,
    enabled: true
};
`;

    await fs.promises.writeFile(iconFile, content);
    console.log(`✓ Created icon configuration: ${path.relative(process.cwd(), iconFile)}`);
}

/**
 * Update store file with new icon set
 * @param {string} name - Icon set name
 */
async function updateStore(name) {
    const storeFile = path.join(__dirname, '../src/core/store.js');
    let content = await fs.promises.readFile(storeFile, 'utf8');

    const exportName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const importStatement = `import { ${exportName} } from './icons/${name}';\n`;

    // If this is the first import, add it before the first comment
    if (!content.includes('import')) {
        const docComment = content.indexOf('/**');
        content = importStatement + content;
    } else if (!content.includes(importStatement)) {
        // Add import alongside other imports
        const lastImport = content.lastIndexOf('import');
        const nextNewline = content.indexOf('\n', lastImport) + 1;
        content = content.slice(0, nextNewline) + importStatement + content.slice(nextNewline);
    }

    // Add to store object if it doesn't exist
    if (!content.includes(`    ${exportName},`)) {
        const storeStart = content.indexOf('export const iconStore = {');
        const insertPos = content.indexOf('\n', storeStart) + 1;
        content = content.slice(0, insertPos) + 
                 `    ${exportName},\n` + 
                 content.slice(insertPos);
    }

    await fs.promises.writeFile(storeFile, content);
    console.log(`✓ Updated store file: ${path.relative(process.cwd(), storeFile)}`);
}

/**
 * Generate icons from a directory
 * @param {Object} config - Icon generation configuration
 * @returns {Promise<void>}
 */
async function generateIcons(config) {
    const { url, name, label } = config;

    try {
        const svgDir = await cloneGitHubDirectory(url);
        const files = await fs.promises.readdir(svgDir);
        
        const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');
        
        if (svgFiles.length === 0) {
            throw new Error('No SVG files found in the specified directory');
        }

        const icons = svgFiles.map(file => {
            const filePath = path.join(svgDir, file);
            const svg = fs.readFileSync(filePath, 'utf8');
            const iconName = path.basename(file, '.svg');

            return {
                source: svg,
                name: iconName,
                label: iconName.split(/[-_\s]+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
            };
        });

        // Update data file
        await updateDataFile(name, icons);

        // Update core icons file
        await updateCoreIcons(name, label);

        // Update store file
        await updateStore(name);

        console.log(`✓ Generated ${icons.length} icons for ${label}`);

    } catch (err) {
        console.error(`Error generating icons for ${label}: ${err.message}`);
        throw err;
    } finally {
        // Clean up temporary directory
        if (fs.existsSync(TEMP_DIR)) {
            fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        }
    }
}

/**
 * Main function to handle icon generation
 */
async function main() {
    try {
        console.log('\n' + '─'.repeat(50));
        console.log('SVG Icon Generator');
        console.log('─'.repeat(50) + '\n');

        const config = {
            url: await prompt({
                question: '📁 GitHub repository URL (e.g., https://github.com/phosphor-icons/core/tree/main/assets/regular): ',
                validate: (url) => url.includes('github.com')
            }),
            name: await prompt({
                question: '📝 Icon set name (e.g., phosphor): ',
                validate: (name) => /^[a-z0-9-]+$/.test(name)
            }),
            label: await prompt({
                question: '🏷  Icon set label (e.g., Phosphor Icons): ',
                validate: (label) => label.length > 0
            })
        };

        console.log('\n' + '─'.repeat(50));
        console.log('Starting icon generation...');
        
        await generateIcons(config);
        
        console.log('─'.repeat(50));
        console.log('✓ Icon generation completed successfully!');
        
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the generator
main();