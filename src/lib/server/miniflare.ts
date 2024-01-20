import { Miniflare } from 'miniflare';
import TOML from '@iarna/toml';

let platform: App.Platform;


export async function setupPlatform(): Promise<App.Platform> {
  if (platform) {
    return platform;
  }

  const fs = await import('fs')
  const tomlText = fs.readFileSync('wrangler.toml', 'utf8');
  const toml: {
    kv_namespaces?: { binding: string, id: string, preview_id: string }[],
    d1_databases?: { binding: string, database_name: string, database_id: string, preview_database_id: string }[],
    compatibility_date: string,
  } = TOML.parse(tomlText) as any;

  const kvs = Object.fromEntries((toml.kv_namespaces || []).map(d => [d.binding, d.id]));
  const dbs = Object.fromEntries((toml.d1_databases || []).map(d => [d.binding, d.preview_database_id ?? d.database_id]));

  const root = '.wrangler/state/v3'; // was '.mf' but match wrangler

  const mf = new Miniflare({
    modules: true,
    script: '',
    d1Databases: dbs,
    kvNamespaces: kvs,
    kvPersist: `${root}/kv`,
    d1Persist: `${root}/d1`,
  });


  platform = {
    env: await mf.getBindings(),
    context: {},
    caches: {},
    cf: {},
  } as App.Platform;

  return platform
}


