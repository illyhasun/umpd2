import mongoose from "mongoose"

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    personalNumber: {
        type: Number,
        required: true,
        unique: true
    },
    workingMode: [{
        modeName: {
            type: String,
            required: true,
        },
        validFrom: {
            month: {
                type: Number,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            }
        }
    }],

    workingTime: [{
        timeName: {
            type: String,
            required: true,
        },
        validFrom: {
            month: {
                type: Number,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            }
        },
        number: {
            type: Number,
            default: 1
        },
        workingDays: {
            type: [Number],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length === 7;  // Проверка, что массив всегда длины 7
                },
                message: 'workingDays должен содержать ровно 7 элементов'
            },
            default: [0, 0, 0, 0, 0, 0, 0]  // По умолчанию массив из 7 нулей
        }
    }],
    eShifts: [{
        date: {
            day: {
                type: Number,
                required: true,
            },
            month: {
                type: Number,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
        },
        from: {
            type: Number,
            required: true,
        },
        to: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true
        }
    }],
    shifts: [{
        date: {
            day: {
                type: Number,
                required: true,
            },
            month: {
                type: Number,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
        },
        from: {
            type: Number,
            required: true,
        },
        to: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true
        }
    }],
})

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema)

