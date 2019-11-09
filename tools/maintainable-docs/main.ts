import generateApiReference from './api-reference-generation';
import checkLinks from './check-links';
import checkCoverage from './check-coverage';

function usageError(message: string) {
    console.error(message)
    process.exit(1)
}

export async function main() {
    const command = process.argv[2]
    if (!command) {
        return usageError('Error: no command specified (must be either check-links or check-coverage)')
    }
    if (['check-links', 'check-coverage', 'generate-reference'].indexOf(command) === -1) {
        return usageError(`Error: unknown command '${command}'`)
    }

    if (command === 'check-coverage') {
        const rootPath = process.argv[3]
        await checkCoverage(rootPath)
    } else if (command === 'check-links') {
        await checkLinks()
    } else if (command === 'generate-reference') {
        const rootPath = process.argv[3]
        await generateApiReference(rootPath)
    }
}

main()
