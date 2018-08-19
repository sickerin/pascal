/* global google */
import React, { Component } from "react";
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { connect } from "react-redux";
import { withFirestore } from "react-redux-firebase";
import {
  composeValidators,
  combineValidators,
  isRequired,
  hasLengthGreaterThan
} from "revalidate";
import { createTask, updateTask, cancelToggle } from "../taskActions";
import Script from "react-load-script";
import { reduxForm, Field } from "redux-form";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import SelectInput from "../../../app/common/form/SelectInput";
import DateInput from "../../../app/common/form/DateInput";
import PlaceInput from "../../../app/common/form/PlaceInput";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";

const mapState = state => {
  let task = {};

  if (state.firestore.ordered.tasks && state.firestore.ordered.tasks[0]) {
    task = state.firestore.ordered.tasks[0];
  }

  return {
    initialValues: task,
    task: task,
    loading: state.async.loading
  };
};

const actions = {
  createTask,
  updateTask,
  cancelToggle
};

const category = [
  { key: "security", text: "Security", value: "security" },
  { key: "maintenance", text: "Maintenance", value: "maintenance" },
  { key: "usher", text: "Usher", value: "usher" },
  { key: "messenger", text: "Messenger", value: "messenger" }
];

const validate = combineValidators({
  title: isRequired({ message: "Task title is required" }),
  category: isRequired({ message: "Category is required" }),
  description: composeValidators(
    isRequired({ message: "Please enter description" }),
    hasLengthGreaterThan(4)({
      message: "Description needs to be at least 5 characters"
    })
  )(),
  // city: isRequired("City"),
  // venue: isRequired("Venue"),
  date: isRequired("Date and Time")
});

class TaskForm extends Component {
  state = {
    cityLatLng: {},
    venueLatLng: {},
    scriptLoaded: false
  };

  async componentDidMount() {
    const { firestore, match } = this.props;
    await firestore.setListener(`tasks/${match.params.id}`);
  }

  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`tasks/${match.params.id}`);
  }

  handleScriptLoaded = () => this.setState({ scriptLoaded: true });

  handleCitySelect = selectedCity => {
    geocodeByAddress(selectedCity)
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          cityLatLng: latlng
        });
      })
      .then(() => {
        this.props.change("city", selectedCity);
      });
  };

  handleVenueSelect = selectedVenue => {
    geocodeByAddress(selectedVenue)
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          venueLatLng: latlng
        });
      })
      .then(() => {
        this.props.change("venue", selectedVenue);
      });
  };

  onFormSubmit = values => {
    values.venueLatLng = this.state.venueLatLng;
    if (this.props.initialValues.id) {
      if (Object.keys(values.venueLatLng).length === 0) {
        values.venueLatLng = this.props.task.venueLatLng;
      }
      this.props.updateTask(values);
      this.props.history.goBack();
    } else {
      this.props.createTask(values);
      this.props.history.push("/tasks");
    }
  };

  render() {
    const {
      invalid,
      submitting,
      pristine,
      task,
      cancelToggle,
      loading
    } = this.props;
    return (
      <Grid>
        <Script
          url="https://maps.googleapis.com/maps/api/js?key=AIzaSyDOnd6oOXfeZUd67Vfx5YzKXR9BbXCrmSQ&libraries=places"
          onLoad={this.handleScriptLoaded}
        />
        <Grid.Column width={10}>
          <Segment>
            <Header sub color="teal" content="Task Details" />
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
              <Field
                name="title"
                type="text"
                component={TextInput}
                placeholder="Give your task a name"
              />
              <Field
                name="category"
                type="text"
                options={category}
                component={SelectInput}
                placeholder="Cateogry"
              />
              <Field
                name="description"
                type="text"
                rows={3}
                component={TextArea}
                placeholder="Description"
              />
              <Header sub color="teal" content="Task location details" />
              <Field
                name="city"
                type="text"
                options={{ types: ["(cities)"] }}
                component={PlaceInput}
                placeholder="City"
                //allows up to put what's in state into field
                onSelect={this.handleCitySelect}
              />
              {/* ONE PROBLEM I"M HAVING IS THAT CLICKING DOESN"t IMMEDIATELY LOAD THE TEXT!!!! */}
              {this.state.scriptLoaded && (
                <Field
                  name="venue"
                  type="text"
                  options={{
                    location: new google.maps.LatLng(this.state.cityLatLng),
                    radius: 1000, //1km radius
                    types: ["establishment"]
                  }}
                  component={PlaceInput}
                  placeholder="Venue"
                  onSelect={this.handleVenueSelect}
                />
              )}
              <Field
                name="date"
                type="text"
                component={DateInput}
                // add dash ibelow nstead of /, to prevent deprecation warnings
                dateFormat="YYYY/MM/DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelect
                placeholder="Date and Time"
              />
              {/* How does below work?????? Ans: they are inside this.pros, console log it out to see Section 82 */}
              <Button
                loading={loading}
                disabled={pristine || submitting || invalid}
                positive
                type="submit"
              >
                Submit
              </Button>
              <Button
                disabled={loading}
                onClick={this.props.history.goBack}
                type="button"
              >
                Cancel
              </Button>
              {task.id && (
                <Button
                  onClick={() => cancelToggle(!task.cancelled, task.id)}
                  type="button"
                  color={task.cancelled ? "green" : "red"}
                  floated="right"
                  content={task.cancelled ? "Reactivate Task" : "Cancel Task"}
                />
              )}
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default withFirestore(
  connect(
    mapState,
    actions
  )(
    reduxForm({ form: "taskForm", enableReinitialize: true, validate })(
      TaskForm
    )
  )
);
