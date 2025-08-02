const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    services: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        cost: Number,
        duration: Number, // in minutes
        availability: {
            type: Boolean,
            default: true
        }
    }],
    location: {
        building: String,
        floor: String,
        roomNumbers: [String]
    },
    contactInfo: {
        email: String,
        phone: String,
        extension: String
    },
    workingHours: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        isOpen: {
            type: Boolean,
            default: true
        },
        openTime: String,
        closeTime: String
    }],
    facilities: [{
        name: String,
        description: String,
        quantity: Number
    }],
    stats: {
        totalPatients: {
            type: Number,
            default: 0
        },
        avgWaitTime: {
            type: Number,
            default: 0
        },
        satisfactionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    imageUrl: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for getting the number of doctors
departmentSchema.virtual('doctorCount').get(function() {
    return this.doctors.length;
});

// Method to check if a service is available
departmentSchema.methods.isServiceAvailable = function(serviceName) {
    const service = this.services.find(s => s.name === serviceName);
    return service && service.availability;
};

// Method to get available time slots for a specific day
departmentSchema.methods.getAvailableSlots = function(date) {
    const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' });
    const schedule = this.workingHours.find(h => h.day === dayOfWeek);
    
    if (!schedule || !schedule.isOpen) return [];
    
    // Implementation for calculating available time slots
    // based on working hours and existing appointments
    // This would need to be implemented based on your specific requirements
};

// Method to update department statistics
departmentSchema.methods.updateStats = async function() {
    const Appointment = mongoose.model('Appointment');
    
    // Calculate total patients
    const totalPatients = await Appointment.distinct('patientId', {
        doctorId: { $in: this.doctors },
        status: 'completed'
    }).countDocuments();
    
    // Calculate average wait time (implementation depends on your requirements)
    
    // Calculate satisfaction rate from appointment reviews
    const appointments = await Appointment.find({
        doctorId: { $in: this.doctors },
        'reviews.rating': { $exists: true }
    });
    
    if (appointments.length > 0) {
        const totalRating = appointments.reduce((sum, apt) => sum + apt.reviews.rating, 0);
        this.stats.satisfactionRate = totalRating / appointments.length;
    }
    
    this.stats.totalPatients = totalPatients;
    await this.save();
};

// Index for faster searches
departmentSchema.index({ name: 'text', 'services.name': 'text' });

module.exports = mongoose.model('Department', departmentSchema);
