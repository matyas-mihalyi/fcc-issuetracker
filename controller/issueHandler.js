const { Schema, default: mongoose } = require("mongoose");

// mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string')

const IssueSchema = new Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  status_text: {type: String, required: false, default: ""},
  assigned_to: {type: String, required: false, default: ""},
  created_on: {type: Date, required: true, default: Date.now()},
  updated_on: {type: Date, required: true, default: Date.now()},
  open: {type: Boolean, required: true, default: true},
}, { 
  versionKey: false ,
  minimize: false
});


const saveIssue = async (project, input) => {    
  const IssueModel = mongoose.model("Issue", IssueSchema, project);
  try {
    const data = {
      issue_title: input.issue_title,
      issue_text: input.issue_text,
      created_by: input.created_by,
      assigned_to: input.assigned_to,
      status_text: input.status_text,
    };
    const document = new IssueModel(input);
    await document.save();
    return document
  }
  catch (err) {
    if (err.name === "ValidationError" && /required/.test(err.message)) {
      throw new Error('required field(s) missing');
    }
    throw new Error("Error while saving document", err)
  }
}

const findIssues = async (project = "", queries) => {
  try {
    const IssueModel = mongoose.model("Issue", IssueSchema, project);
    const issues = await IssueModel.find(queries);
    return issues;
  }
  catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

const updateIssue = async (project, input) => {
  try {
    handleMissingId(input._id);
    handleEmptyInput(input);
    const IssueModel = mongoose.model("Issue", IssueSchema, project);
    const document = await IssueModel.findById(mongoose.Types.ObjectId(input._id));
    if (document == null) throw new Error('could not update');
    updateDocument(document, input);
    document.updated_on = Date.now();
    
    await document.save({ validateBeforeSave: false });
    
    return { result: 'successfully updated', _id: input._id };
  }
  catch (err) {
    if(err.name === "BSONTypeError") {
      throw new Error('could not update', err);
    }
    throw new Error(err.message || 'could not update', err);
  }
}

const deleteIssue = async (project, input) => {
  try {
    handleMissingId(input._id);
    const IssueModel = mongoose.model("Issue", IssueSchema, project);
    const document = await IssueModel.findByIdAndRemove(mongoose.Types.ObjectId(input._id));
    if (document == null) throw new Error('could not delete');
    return { result: 'successfully deleted', _id: input._id };
  }
  catch (err) {
    throw new Error (err.message || 'could not delete', err);
  }
}

function updateDocument (doc, data) {
  for (const key in data) {
    if (key !== "_id" && data[key] !== "") {
      doc[key] = data[key];
    }
  }
}

function handleMissingId (id) {
  if (!id) {
    throw new Error('missing _id');
  }
}

function handleEmptyInput (input) {
  let empty = true;
  for (const key in input) {
    if (key !== "_id" && input[key] !== "") {
      empty = false;
    }
  }
  if (empty) {
    throw new Error('no update field(s) sent')
  }
}

module.exports = { saveIssue, findIssues, updateIssue, deleteIssue }