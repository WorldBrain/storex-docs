import { findDocumentationModule, generateDocumentationObject } from "./utils/typedoc";

export default async function checkCoverage(rootPath: string) {
    const documentationObject = await generateDocumentationObject(rootPath)
    if (!documentationObject) {
        return
    }
    console.log(documentationObject)
    console.log(findDocumentationModule(documentationObject, 'types/relationships'))
}
