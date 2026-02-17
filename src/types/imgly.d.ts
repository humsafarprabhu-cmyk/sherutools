declare module '@imgly/background-removal' {
  export interface Config {
    progress?: (key: string, current: number, total: number) => void;
    publicPath?: string;
    debug?: boolean;
    model?: 'small' | 'medium';
    output?: {
      format?: 'image/png' | 'image/jpeg' | 'image/webp';
      quality?: number;
    };
  }
  export function removeBackground(
    image: string | Blob | ArrayBuffer | ImageData,
    config?: Config
  ): Promise<Blob>;
}
