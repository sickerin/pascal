import React, { Component } from "react";
import { Form, Button } from "semantic-ui-react";
import { Field, reduxForm } from "redux-form";
import TextArea from "../../../app/common/form/TextArea";

class TaskDetailedChatForm extends Component {
  handleCommentSubmit = values => {
    const { addTaskComment, reset, taskId, closeForm, parentId } = this.props;
    addTaskComment(taskId, values, parentId);
    reset();
    if (parentId !== 0) {
      closeForm();
    }
  };

  render() {
    return (
      <Form onSubmit={this.props.handleSubmit(this.handleCommentSubmit)}>
        <Field name="comment" component={TextArea} rows={2} type="text" />
        <Button content="Add Reply" labelPosition="left" icon="edit" primary />
      </Form>
    );
  }
}

export default reduxForm({ Fields: "comment" })(TaskDetailedChatForm);
