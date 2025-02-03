import mongoose from "mongoose";

const shiftTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    monday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    tuesday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    wednesday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    thursday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    friday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    saturday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    },
    sunday: {
        from: {
            type: Number,
        },
        to: {
            type: Number,
        },
        pause: {
            type: Number,
        }
    }


})

export const ShiftTemplate = mongoose.models.ShiftTemplate || mongoose.model('ShiftTemplate', shiftTemplateSchema)

