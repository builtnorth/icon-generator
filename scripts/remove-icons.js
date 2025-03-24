import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Remove icon set data file
 * @param {string} name - Icon set name
 */
async function removeDataFile(name) {
    const dataFile = path.join(__dirname, '../src/data', `${name}.js`);
    
    if (fs.existsSync(dataFile)) {
        await fs.promises.unlink(dataFile);
        console.log(`✓ Removed data file: ${path.relative(process.cwd(), dataFile)}`);
    }
}

/**
 * Remove icon set from core icons file
 * @param {string} name - Icon set name
 */
async function removeFromCoreIcons(name) {
    const coreFile = path.join(__dirname, '../src/core/icons.js');
    if (!fs.existsSync(coreFile)) return;

    let content = await fs.promises.readFile(coreFile, 'utf8');
    const exportName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    // Remove import statement for icons
    const importRegex = new RegExp(`import\\s*{\\s*${name}Icons\\s*}\\s*from\\s*'../data/${name}';?\n?`);
    content = content.replace(importRegex, '');

    // Remove the entire configuration block
    const configRegex = new RegExp(
        `\n?\\/\\*\\*[^*]*\\*\\s*${exportName}[^*]*\\*\\/\\s*` + // Comment block
        `export\\s+const\\s+${exportName}\\s*=\\s*{[^}]+};?\n?`   // Export statement
    , 'g');
    content = content.replace(configRegex, '');

    // Clean up empty lines
    content = content.replace(/\n{3,}/g, '\n\n')
                    .replace(/^\s*\n/, ''); // Remove leading empty line

    // If file is empty, add a comment
    if (content.trim() === '') {
        content = "// Icon Entry Point - Will be populated when running 'npm run generate-icons'\n";
    }

    await fs.promises.writeFile(coreFile, content);
    console.log(`✓ Removed from core icons file: ${path.relative(process.cwd(), coreFile)}`);
}

/**
 * Remove icon set from store file
 * @param {string} name - Icon set name
 */
async function removeFromStore(name) {
    const storeFile = path.join(__dirname, '../src/core/store.js');
    if (!fs.existsSync(storeFile)) return;

    let content = await fs.promises.readFile(storeFile, 'utf8');
    const exportName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    // Remove import statement if it exists
    const importRegex = new RegExp(`import\\s*{\\s*${exportName}\\s*}\\s*from\\s*'./icons';?\n?`);
    content = content.replace(importRegex, '');

    // Remove the specific icon set line from the store object
    const iconSetLineRegex = new RegExp(`\\s*${exportName},?\n`);
    content = content.replace(iconSetLineRegex, '\n');

    // Clean up any double newlines
    content = content.replace(/\n{3,}/g, '\n\n');

    await fs.promises.writeFile(storeFile, content);
    console.log(`✓ Removed from store file: ${path.relative(process.cwd(), storeFile)}`);
}

/**
 * Remove all references to an icon set
 * @param {string} name - Icon set name
 */
async function removeIconSet(name) {
    try {
        // Remove data file
        await removeDataFile(name);

        // Remove from core icons file
        await removeFromCoreIcons(name);

        // Remove from store file
        await removeFromStore(name);

        console.log(`✓ Successfully removed all references to "${name}" icon set`);
    } catch (err) {
        console.error(`Error removing icon set: ${err.message}`);
        throw err;
    }
}

/**
 * Main function to handle icon set removal
 */
async function main() {
    try {
        console.log('\n' + '─'.repeat(50));
        console.log('Icon Set Removal');
        console.log('─'.repeat(50) + '\n');

        const name = await prompt({
            question: '📝 Icon set name to remove (e.g., phosphor): ',
            validate: (name) => /^[a-z0-9-]+$/.test(name)
        });

        console.log('\n' + '─'.repeat(50));
        console.log('Starting icon set removal...');
        
        await removeIconSet(name);
        
        console.log('─'.repeat(50));
        console.log('✓ Icon set removal completed successfully!');
        
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the removal script
main(); 