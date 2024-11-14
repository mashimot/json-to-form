export interface Definition {
    get: Array<Map<string, string>>,
    formBuilder: string[];
    getters?: Map<string, string>,
    mockData?: {
        parameter_name: string;
        get_name: string;
        values: string[];
    };
}