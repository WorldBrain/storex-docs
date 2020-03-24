import fs from 'fs'
import path from 'path'
import glob from 'glob'
import marked from 'marked'
import colors from 'colors/safe'
import fetch, { Response, FetchError } from 'node-fetch'

interface MarkdownLink {
    href: string
    title: string
    text: string
}

type DocumentError = { absDocumentPath: string } & (
    { type: 'internal-link.target-absent', link: MarkdownLink } |
    { type: 'internal-link.no-trailing-slash', link: MarkdownLink } |
    { type: 'internal-link.relative-url-forbidden', link: MarkdownLink } |
    { type: 'external-link.not-found', link: MarkdownLink } |
    { type: 'external-link.not-ok', link: MarkdownLink } |
    { type: 'external-link.error', link: MarkdownLink, error: FetchError }
)

async function getMarkdownDocumentPaths(args: { rootDir: string }): Promise<string[]> {
    return glob.sync(`${args.rootDir}/**/*.md`)
}

async function checkMarkdownDocument(args: { rootDir: string, absDocumentPath: string, content: string }): Promise<{ errors: DocumentError[] }> {
    const { links } = await parseMarkdownDocument(args)

    const errors: DocumentError[] = []
    for (const link of links) {
        const error = await checkMarkdownLink({
            ...args,
            link,
        })
        if (error) {
            errors.push(error)
        }
    }

    return { errors }
}

async function parseMarkdownDocument(args: { rootDir: string; absDocumentPath: string; content: string; }): Promise<{
    links: Array<MarkdownLink>
}> {
    const links: Array<MarkdownLink> = []
    const renderer = new marked.Renderer()
    renderer.link = (href: string, title: string, text: string) => {
        links.push({ href, title, text })
        return ''
    }
    marked(args.content, { renderer })

    return { links }
}

async function checkMarkdownLink(args: { rootDir: string, absDocumentPath: string, link: MarkdownLink }): Promise<DocumentError | null> {
    const href = args.link.href
    const originalHost = 'worldbrain.github.io'
    const parsedUrl = new URL(href, `https://${originalHost}/storex-docs/`)

    if (parsedUrl.host !== originalHost) {
        return checkExternalLink(args)
    }

    if (parsedUrl.pathname.charAt(0) !== '/') {
        return { type: 'internal-link.relative-url-forbidden', ...args }
    }
    if (parsedUrl.pathname.substr(-1) !== '/') {
        return { type: 'internal-link.no-trailing-slash', ...args }
    }

    const targetDirWithTrailingSlash = path.join(args.rootDir, parsedUrl.pathname.substr(1))
    const targetFilePath = path.join(targetDirWithTrailingSlash, 'README.md')
    const targetExists = fs.existsSync(targetFilePath)
    if (!targetExists) {
        return { type: 'internal-link.target-absent', ...args }
    }

    return null
}

async function checkExternalLink(args: { absDocumentPath: string, link: MarkdownLink }): Promise<DocumentError | null> {
    console.log(`Check external link:`, args.link.href)

    let response: Response
    try {
        response = await fetch(args.link.href)
    } catch (error) {
        return { type: 'external-link.error', error, ...args }
    }
    if (!response.ok) {
        if (response.status === 400) {
            return { type: 'external-link.not-found', ...args }
        } else {
            return { type: 'external-link.not-ok', ...args }
        }
    }
    return null
}

function getHumanReadableError(error: DocumentError): string {
    if (error.type === 'internal-link.no-trailing-slash') {
        return `${error.absDocumentPath} - found link without trailing slash: ${error.link.href}`
    } else if (error.type === 'internal-link.target-absent') {
        return `${error.absDocumentPath} - found link to non-existent document: ${error.link.href}`
    } else if (error.type === 'internal-link.relative-url-forbidden') {
        return `${error.absDocumentPath} - found relative link, but all links must be absolute: ${error.link.href}`
    } else {
        return `${error.absDocumentPath} - non-human-readable error checking this link: ${error.link.href}`
    }
}

export default async function checkLinks() {
    const rootDir = path.join(__dirname, '../../docs')

    const docPaths = await getMarkdownDocumentPaths({ rootDir })
    const errors: DocumentError[][] = await Promise.all(docPaths.map(async absDocumentPath => {
        const content = fs.readFileSync(absDocumentPath).toString()
        const checkResult = await checkMarkdownDocument({
            rootDir,
            absDocumentPath,
            content
        })
        return checkResult.errors
    }))

    for (const errorSet of errors) {
        for (const error of errorSet) {
            console.error(colors.red('ERROR:'), getHumanReadableError(error))
        }
    }
}