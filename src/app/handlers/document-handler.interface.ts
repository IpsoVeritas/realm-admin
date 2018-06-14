export interface DocumentHandler {
  handle(context: any, document: any): Promise<any>;
}
