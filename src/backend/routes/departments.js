const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Department = require('../models/Department');

// @route   GET api/departments
// @desc    Get all departments
// @access  Public
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('head', 'name specialization')
            .select('-doctors');
        res.json(departments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/departments/:id
// @desc    Get department by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('head', 'name specialization')
            .populate('doctors', 'name specialization experience ratings');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json(department);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/departments
// @desc    Create a department
// @access  Private (Admin only)
router.post('/', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const {
            name,
            description,
            head,
            services,
            location,
            contactInfo,
            workingHours,
            facilities,
            imageUrl
        } = req.body;

        const department = new Department({
            name,
            description,
            head,
            services: services || [],
            location,
            contactInfo,
            workingHours: workingHours || [],
            facilities: facilities || [],
            imageUrl
        });

        await department.save();
        res.json(department);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/departments/:id
// @desc    Update a department
// @access  Private (Admin only)
router.put('/:id', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const {
            name,
            description,
            head,
            services,
            location,
            contactInfo,
            workingHours,
            facilities,
            imageUrl,
            isActive
        } = req.body;

        // Update fields
        if (name) department.name = name;
        if (description) department.description = description;
        if (head) department.head = head;
        if (services) department.services = services;
        if (location) department.location = location;
        if (contactInfo) department.contactInfo = contactInfo;
        if (workingHours) department.workingHours = workingHours;
        if (facilities) department.facilities = facilities;
        if (imageUrl) department.imageUrl = imageUrl;
        if (typeof isActive === 'boolean') department.isActive = isActive;

        await department.save();
        res.json(department);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/departments/:id
// @desc    Delete a department
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        await department.remove();
        res.json({ message: 'Department removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/departments/:id/doctors
// @desc    Get all doctors in a department
// @access  Public
router.get('/:id/doctors', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('doctors', 'name specialization experience ratings schedule');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json(department.doctors);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/departments/:id/doctors
// @desc    Add a doctor to department
// @access  Private (Admin only)
router.post('/:id/doctors', [
    auth,
    [
        check('doctorId', 'Doctor ID is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const { doctorId } = req.body;

        if (department.doctors.includes(doctorId)) {
            return res.status(400).json({ message: 'Doctor already in department' });
        }

        department.doctors.push(doctorId);
        await department.save();

        await department.populate('doctors', 'name specialization experience ratings');
        res.json(department);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid ID' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/departments/:id/doctors/:doctorId
// @desc    Remove a doctor from department
// @access  Private (Admin only)
router.delete('/:id/doctors/:doctorId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const removeIndex = department.doctors.indexOf(req.params.doctorId);
        if (removeIndex === -1) {
            return res.status(404).json({ message: 'Doctor not found in department' });
        }

        department.doctors.splice(removeIndex, 1);
        await department.save();

        res.json({ message: 'Doctor removed from department' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid ID' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
