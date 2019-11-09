import fs from 'fs'
import * as TypeDoc from 'typedoc'

export interface DocumentationObject {
    children: any[]
}

export async function generateDocumentationObject(rootPath: string): Promise<DocumentationObject | null> {
    const app = new TypeDoc.Application({
        mode: 'Modules',
        logger: 'console',
        target: 'ES5',
        module: 'CommonJS',
        experimentalDecorators: true,
        typeRoots: [
            rootPath + "/node_modules/@types"
        ],
    })

    const project = app.convert(app.expandInputFiles([rootPath + '/ts']))

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
