export interface Definition {
    get: Array<Map<string, string>>,
    lastDefinition: Map<string, string>,
    formBuilder: string[];
    mockData?: {
        parameter_name: string;
        get_name: string;
        values: string[];
    }
}