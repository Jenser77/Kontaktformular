import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function GET() {
    try {
        // Resolve static index.html path. Depending on build environment this path might vary. 
        // For development it's mostly root/static/index.html
        const filePath = join(__dirname, '../../static/index.html');
        const content = readFileSync(filePath, 'utf-8');

        return new Response(content, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch {
        // Fallback for production build environments
        const fallbackPath = join(process.cwd(), 'client', 'index.html');
        try {
            const content = readFileSync(fallbackPath, 'utf-8');
            return new Response(content, {
                headers: { 'Content-Type': 'text/html' }
            });
        } catch {
            return new Response("Home Page (index.html not found)", { status: 404 });
        }
    }
}
