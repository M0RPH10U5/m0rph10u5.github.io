export const LogsSchema = {
    type: 'logs',
    
    root: {
        type: 'array',
        itemType: 'object',

        item: {
            required: ['date', 'user', 'title', 'entry'],

            shape: {
                data: {
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    required: true,
                    sortable: true
                },

                user: {
                    type: 'string',
                    required: true,
                    source: 'users',
                    ui: 'select'
                },

                title: {
                    type: 'string',
                    required: true,
                    maxLength: 255,
                    ui: 'text'
                },

                entry: {
                    type: 'string',
                    required: true,
                    multiline: true,
                    ui: 'textarea',
                    monospace: true
                }
            }
        }
    }
};