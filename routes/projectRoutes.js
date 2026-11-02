const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMilestone,
  updateMilestone,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createProject).get(getProjects);
router.route('/:id').get(getProjectById).delete(deleteProject);
router.post('/:id/milestones', addMilestone);
router.patch('/:id/milestones/:milestoneId', updateMilestone);

module.exports = router;
