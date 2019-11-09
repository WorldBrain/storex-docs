import { generateDocumentationObject } from "../utils/typedoc";

export default async function generateApiReference(rootPath: string) {
    const documentationObject = await generateDocumentationObject(rootPath)
    if (!documentationObject) {
        return
    }
}

