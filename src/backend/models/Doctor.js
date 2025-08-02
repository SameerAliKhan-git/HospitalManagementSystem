const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    maxAppointments: {
        type: Number,
        default: 8
    },
    breakTime: {
        start: String,
        end: String
    }
});

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        additionalInfo: String
    }],
    experience: {
        type: Number,
        required: true
    },
    expertise: [{
        type: String
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    schedule: [scheduleSchema],
    consultationFee: {
        type: Number,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    languages: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    about: {
        type: String
    },
    profileImage: {
        type: String
    },
    achievements: [{
        title: String,
        description: String,
        year: Number
    }],
    publications: [{
        title: String,
        journal: String,
        year: Number,
        link: String
    }]
}, {
    timestamps: true
});

// Calculate average rating whenever a review is added or modified
doctorSchema.pre('save', function(next) {
    if (this.isModified('reviews')) {
        if (this.reviews.length === 0) {
            this.averageRating = 0;
        } else {
            const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
            this.averageRating = (sum / this.reviews.length).toFixed(1);
        }
    }
    next();
});

// Method to check availability for a specific time slot
doctorSchema.methods.isTimeSlotAvailable = async function(date, time) {
    const dayOfWeek = new Date(date).toLocaleLowerCase('en-US', { weekday: 'long' });
    const schedule = this.schedule.find(s => s.day === dayOfWeek);
    
    if (!schedule || !schedule.isAvailable) return false;
    
    // Check if time is within working hours
    if (time < schedule.startTime || time > schedule.endTime) return false;
    
    // Check if time is during break time
    if (schedule.breakTime) {
        if (time >= schedule.breakTime.start && time <= schedule.breakTime.end) {
            return false;
        }
    }
    
    // Check number of existing appointments
    const appointments = await mongoose.model('Appointment').countDocuments({
        doctor: this._id,
        date: date,
        time: time,
        status: { $ne: 'cancelled' }
    });
    
    return appointments < schedule.maxAppointments;
};

module.exports = mongoose.model('Doctor', doctorSchema);
