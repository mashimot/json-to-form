export interface Definition {
    get: Map<string, string>[],
    lastDefinition: Map<string, string>,
    formBuilder: string[],
    formBuilderArray: {
        open: string[],
        close: string[]
    }
}