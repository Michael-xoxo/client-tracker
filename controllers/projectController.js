const mongoose = require('mongoose');
const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, clientName, clientEmail, budget, status, milestones } = req.body;

    if (!title || !clientName || !clientEmail) {
      return res.status(400).json({ message: 'Please provide title, clientName, and clientEmail' });
    }

    const project = await Project.create({
      user: req.user._id,
      title,
      clientName,
      clientEmail,
      ...(budget !== undefined && { budget }),
      ...(status && { status }),
      ...(Array.isArray(milestones) && { milestones }),
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Get all projects owned by current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID (if owned by user)
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get sanitized project for public client portal
// @route   GET /api/projects/portal/:id
// @access  Public
const getPublicProjectPortal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({
      _id: project._id,
      title: project.title,
      clientName: project.clientName,
      status: project.status,
      milestones: (project.milestones || []).map((m) => ({
        _id: m._id,
        title: m.title,
        completed: m.completed,
        dueDate: m.dueDate,
      })),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add milestone to a project
// @route   POST /api/projects/:id/milestones
// @access  Private
const addMilestone = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, completed, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Please provide a milestone title' });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.milestones.push({
      title,
      ...(completed !== undefined && { completed: Boolean(completed) }),
      ...(dueDate && { dueDate }),
    });

    await project.save();

    return res.status(201).json(project);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle or set milestone completed state
// @route   PATCH /api/projects/:id/milestones/:milestoneId
// @access  Private
const updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(milestoneId)) {
      return res.status(404).json({ message: 'Project or milestone not found' });
    }

    const project = await Project.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const nextCompleted =
      req.body && typeof req.body.completed === 'boolean'
        ? req.body.completed
        : !milestone.completed;

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, user: req.user._id, 'milestones._id': milestoneId },
      { $set: { 'milestones.$.completed': nextCompleted } },
      { returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json(updatedProject);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project or milestone not found' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project by ID
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Project deleted', _id: project._id });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getPublicProjectPortal,
  addMilestone,
  updateMilestone,
  deleteProject,
};
