'use strict';

const { saveIssue, findIssues, updateIssue, deleteIssue } = require('../controller/issueHandler');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      try {
        const queries = req.query;
        const project = req.params.project;
        const issues = await findIssues(project, queries);
        res.json(issues);
      }
      catch (err) {
        console.error(err);
        res.status(200);
        res.json({error: err.message});
      }
    })
    
    .post(async (req, res) => {
      const project = req.params.project;
      try {
        const document = saveIssue(project, req.body);
        res.status(201);
        res.json(await document);
      }
      catch (err) {
        res.status(200);
        res.json({error: err.message});
      }
    })
    
    .put(async (req, res) => {
      try {
        const project = req.params.project;
        const document = updateIssue(project, req.body);
        res.json(await document);
      }
      catch (err) {
        res.status(200);
        res.json({error: err.message, _id: req.body._id});
      }
    })
    
    .delete(async (req, res) => {
      try {
        const project = req.params.project;
        const result = await deleteIssue(project, req.body);
        res.json(result);
      } 
      catch (err) {
        res.status(200);
        res.json({error: err.message, _id: req.body._id});
      }      
    });
    
};
