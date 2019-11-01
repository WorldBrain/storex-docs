import fs from 'fs'
import * as TypeDoc from 'typedoc'
import { checkLinks } from './check-links';

export interface DocumentationObject {
    children: any[]
}

export function generateDocumentationObject(rootPath: string): DocumentationObject | null {
    const app = new TypeDoc.Application({
        mode: 'Modules',
        logger: 'console',
        target: 'ES5',
        module: 'CommonJS',
        experimentalDecorators: true,
        typeRoots: [
            rootPath + "/node_modules/@types"
        ],
    });

    const project = app.convert(app.expandInputFiles([rootPath + '/ts']));

    if (project) { // Project may not have converted correctly
        const tempFilePath = '/tmp/documentation.json'

        // Alternatively generate JSON output
        app.generateJson(project, tempFilePath)

        return JSON.parse(fs.readFileSync(tempFilePath).toString())
    } else {
        return null
    }
}

export function findDocumentationModule(documentationObject: DocumentationObject, moduleName: string) {
    for (const child of documentationObject.children) {
        if (child.kindString === 'External module' && child.name === `"${moduleName}"`) {
            return child
        }
    }

    return null
}

function usageError(message: string) {
    console.error(message)
    process.exit(1)
}

export async function main() {
    const command = process.argv[2]
    if (!command) {
        return usageError('Error: no command specified (must be either check-links or check-coverage)')
    }
    if (['check-links', 'check-coverage'].indexOf(command) === -1) {
        return usageError(`Error: unknown command '${command}'`)
    }

    if (command === 'check-coverage') {
        const documentationObject = generateDocumentationObject(process.argv[3])
        if (!documentationObject) {
            return
        }
        console.log(documentationObject)
        console.log(findDocumentationModule(documentationObject, 'types/relationships'))
    } else if (command === 'check-links') {
        await checkLinks()
    }
}

main()