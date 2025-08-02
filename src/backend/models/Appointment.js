const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
    medicine: {
        type: String,
        required: true
    },
    dosage: {
        amount: Number,
        unit: String,
        frequency: String,
        timing: {
            type: String,
            enum: ['before_meal', 'after_meal', 'with_meal', 'any_time']
        }
    },
    duration: {
        value: Number,
        unit: {
            type: String,
            enum: ['days', 'weeks', 'months']
        }
    },
    instructions: String
});

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_visit', 'vaccination'],
        required: true
    },
    reasonForVisit: {
        type: String,
        required: true
    },
    symptoms: [{
        name: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        duration: String
    }],
    vitals: {
        bloodPressure: String,
        temperature: Number,
        heartRate: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number,
        weight: Number,
        height: Number
    },
    diagnosis: [{
        condition: String,
        notes: String,
        icdCode: String // International Classification of Diseases code
    }],
    prescription: [prescriptionItemSchema],
    labTests: [{
        testName: String,
        reason: String,
        status: {
            type: String,
            enum: ['ordered', 'completed', 'cancelled'],
            default: 'ordered'
        },
        results: {
            value: String,
            unit: String,
            normalRange: String,
            interpretation: String,
            reportDate: Date
        }
    }],
    followUp: {
        recommended: Boolean,
        date: Date,
        notes: String
    },
    payment: {
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded', 'failed'],
            default: 'pending'
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'insurance', 'online']
        },
        transactionId: String,
        insurance: {
            provider: String,
            policyNumber: String,
            approvalCode: String,
            coverage: Number
        },
        receipt: {
            number: String,
            generatedAt: Date
        }
    },
    doctorNotes: {
        type: String,
        private: true // Only accessible to medical staff
    },
    patientNotes: String, // Patient's own notes
    attachments: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reminders: [{
        type: {
            type: String,
            enum: ['appointment', 'medication', 'follow_up']
        },
        message: String,
        scheduledFor: Date,
        sent: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Indexes for faster queries
appointmentSchema.index({ patientId: 1, dateTime: -1 });
appointmentSchema.index({ doctorId: 1, dateTime: -1 });
appointmentSchema.index({ status: 1, dateTime: 1 });

// Virtual for appointment duration (default 30 minutes)
appointmentSchema.virtual('endTime').get(function() {
    return new Date(this.dateTime.getTime() + 30 * 60000);
});

// Method to check if appointment time conflicts with existing appointments
appointmentSchema.methods.hasTimeConflict = async function() {
    const startTime = this.dateTime;
    const endTime = this.endTime;

    const conflictingAppointments = await this.constructor.find({
        doctorId: this.doctorId,
        _id: { $ne: this._id },
        status: { $nin: ['cancelled', 'no_show'] },
        dateTime: {
            $lt: endTime,
            $gt: startTime
        }
    });

    return conflictingAppointments.length > 0;
};

// Method to generate prescription PDF
appointmentSchema.methods.generatePrescriptionPDF = async function() {
    // Implementation for generating PDF
    // This would typically use a PDF generation library
    return 'prescription.pdf';
};

// Method to send appointment reminder
appointmentSchema.methods.sendReminder = async function() {
    const reminder = {
        type: 'appointment',
        message: `Reminder: You have an appointment scheduled for ${this.dateTime.toLocaleString()}`,
        scheduledFor: new Date(this.dateTime.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    };
    
    this.reminders.push(reminder);
    await this.save();
    
    // Implementation for sending actual reminder (email/SMS)
    // This would typically use a notification service
};

// Method to calculate appointment cost including insurance
appointmentSchema.methods.calculateCost = function() {
    let totalCost = this.payment.amount;
    
    if (this.payment.insurance && this.payment.insurance.coverage) {
        const coverage = this.payment.insurance.coverage;
        const insuranceCoverage = (coverage / 100) * totalCost;
        totalCost -= insuranceCoverage;
    }
    
    return totalCost;
};

// Middleware to update appointment status based on datetime
appointmentSchema.pre('save', function(next) {
    const now = new Date();
    
    if (this.dateTime < now && this.status === 'scheduled') {
        this.status = 'in_progress';
    }
    
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
