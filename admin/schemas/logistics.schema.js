export const LogisticsSchema = {
    type: 'logistics',

    root: {
        users:{
            type: 'array',
            items:'string',
            required:'true'
        },
        items:{
            type: 'array',
            required: 'true',
            items:{
                type: 'object',
                required: ['item', 'needed', 'inventory'],
                shape: {
                    item: {
                        type: 'string',
                        required: true
                    },
                    needed: {
                        type: 'number',
                        required: true,
                        min: 0
                    },
                    inventory: {
                        type: 'map',          // Special Editor Type
                        keyFrom: 'users',    // Important
                        valueType: 'number',
                        min: 0,
                        required: true
                    }
                }
            }
        }
    }
};
