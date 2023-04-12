export interface Settings {
    apiKey: string;
}

export async function getSettings(): Promise<Settings> {
  let buffer = await fsPromises.readFile("settings.json");
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer))) as Settings;
}
