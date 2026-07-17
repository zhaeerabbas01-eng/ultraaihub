// Deno globals shim for MCP tool files. These files are bundled into a Supabase Edge Function
// at build time and run in the Deno runtime; the Vite type-check just needs the ambient decl.
declare const Deno: { env: { get(key: string): string | undefined } };
