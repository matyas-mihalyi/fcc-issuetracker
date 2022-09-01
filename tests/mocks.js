const validInputMock = {
  issue_title: "this is a valid issue",
  issue_text: "this issue have all the fields filled",
  created_by: "tester",
  status_text: "design",
  assigned_to: "James",
}

const requiredValidInputMock = {
  issue_title: "this is a valid issue",
  issue_text: "this issue have all the fields filled",
  created_by: "tester",
  status_text: "",
  assigned_to: "",
}

const invalidInputMock = {
  issue_title: "this is a valid issue",
  created_by: "tester"
}

const invalidDelRequestMock = {
  _id: '5f665eb46e296f6b9b6a504d', 
  issue_text: 'New Issue Text'
}

const responseKeys = ["_id","issue_title","issue_text","created_on","updated_on","created_by","assigned_to","open","status_text"]

module.exports = { validInputMock, requiredValidInputMock, invalidInputMock, responseKeys, invalidDelRequestMock }