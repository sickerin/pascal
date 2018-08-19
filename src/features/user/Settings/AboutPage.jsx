import React from "react";
import { Button, Divider, Form, Header, Segment } from "semantic-ui-react";
import { Field, reduxForm } from "redux-form";
import RadioInput from "../../../app/common/form/RadioInput";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import PlaceInput from "../../../app/common/form/PlaceInput";
import SelectInput from "../../../app/common/form/SelectInput";

const interests = [
  { key: "security", text: "Security", value: "security" },
  { key: "maintenance", text: "Maintenance", value: "maintenance" },
  { key: "usher", text: "Usher", value: "usher" },
  { key: "messenger", text: "Messenger", value: "messenger" }
];

const AboutPage = ({ pristine, submitting, handleSubmit, updateProfile }) => {
  return (
    <Segment>
      <Header dividing size="large" content="About Me" />
      <p>Complete your profile to get the most out of this site</p>
      <Form onSubmit={handleSubmit(updateProfile)}>
        <Form.Group inline>
          <label>Tell us your role: </label>
          <Field
            name="role"
            component={RadioInput}
            type="radio"
            value="admin"
            label="Admin"
          />
          <Field
            name="role"
            component={RadioInput}
            type="radio"
            value="manager"
            label="Manager"
          />
          <Field
            name="role"
            component={RadioInput}
            type="radio"
            value="security guard"
            label="Security Guard"
          />
        </Form.Group>
        <Divider />
        <label>Tell us about yourself</label>
        <Field name="about" component={TextArea} placeholder="About Me" />
        {/* Using an array to store in forestore, updates the whole thing
         we also can't collect all the individuals who share a specific element
         in array. I.e select all the people who like film, we can't do that*/}
        <Field
          name="interests"
          component={SelectInput}
          options={interests}
          value="interests"
          multiple={true}
          placeholder="Select your interests"
        />
        <Field
          width={8}
          name="occupation"
          type="text"
          component={TextInput}
          placeholder="Occupation"
        />
        <Field
          width={8}
          name="origin"
          options={{ types: ["(regions)"] }}
          component={PlaceInput}
          placeholder="Country of Origin"
        />
        <Divider />
        <Button
          disabled={pristine || submitting}
          size="large"
          positive
          content="Update Profile"
        />
      </Form>
    </Segment>
  );
};

//destoryOnUnmount false, to allow forms to hold data
export default reduxForm({
  form: "userProfile",
  enableReinitialize: true,
  destroyOnUnmount: false
})(AboutPage);
