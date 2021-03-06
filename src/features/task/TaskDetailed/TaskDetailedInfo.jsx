import React, { Component } from "react";
import { Segment, Grid, Icon, Button } from "semantic-ui-react";
import TaskDetailedMap from "./TaskDetailedMap";
import format from "date-fns/format";

class TaskDetailedInfo extends Component {
  state = {
    showMap: false
  };

  //cleanup DOM, networks requests, googlemaps api
  componentWillUnmount() {
    this.setState({
      showMap: false
    });
  }

  showMapToggle = () => {
    this.setState(prevState => ({
      showMap: !prevState.showMap
    }));
  };

  render() {
    const { task } = this.props;
    let taskDate;
    if (task.date) {
      taskDate = task.date.toDate();
    }
    return (
      <Segment.Group>
        <Segment attached="top">
          <Grid>
            <Grid.Column width={1}>
              <Icon size="large" color="teal" name="info" />
            </Grid.Column>
            <Grid.Column width={15}>
              <p>{task.description}</p>
            </Grid.Column>
          </Grid>
        </Segment>
        <Segment attached>
          <Grid verticalAlign="middle">
            <Grid.Column width={1}>
              <Icon name="calendar" size="large" color="teal" />
            </Grid.Column>
            <Grid.Column width={15}>
              <span>
                {format(taskDate, "dddd Mo MMM")} at{" "}
                {format(taskDate, "h:mm A")}
              </span>
            </Grid.Column>
          </Grid>
        </Segment>
        <Segment attached>
          <Grid verticalAlign="middle">
            <Grid.Column width={1}>
              <Icon name="marker" size="large" color="teal" />
            </Grid.Column>
            <Grid.Column width={11}>
              <span>{task.venue}</span>
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                onClick={this.showMapToggle}
                color="teal"
                size="tiny"
                content={this.state.showMap ? "HideMap" : "ShowMap"}
              />
            </Grid.Column>
          </Grid>
        </Segment>
        {this.state.showMap && (
          <TaskDetailedMap
            lat={task.venueLatLng.lat}
            lng={task.venueLatLng.lng}
          />
        )}
      </Segment.Group>
    );
  }
}

export default TaskDetailedInfo;
