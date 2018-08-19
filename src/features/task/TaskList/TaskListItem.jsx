import React, { Component } from "react";
import format from "date-fns/format";
import { Segment, Item, Icon, List, Button, Label } from "semantic-ui-react";
import TaskListAttendee from "./TaskListAttendee";
import { Link } from "react-router-dom";
import { objectToArray } from "../../../app/common/util/helpers";

class TaskListItem extends Component {
  render() {
    const { task } = this.props;
    return (
      <Segment.Group>
        <Segment>
          <Item.Group>
            <Item>
              <Item.Image size="tiny" circular src={task.managerPhotoURL} />
              <Item.Content>
                <Item.Header as={Link} to={`/tasks/${task.id}`}>
                  {task.title}
                </Item.Header>
                <Item.Description>
                  Managed by{" "}
                  <Link to={`/profile/${task.managerUid}`}>
                    {task.managedBy}
                  </Link>
                </Item.Description>
                {task.cancelled && (
                  <Label
                    style={{ top: "-40px" }}
                    ribbon="right"
                    color="red"
                    content="This task has been cancelled"
                  />
                )}
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <Segment>
          <span>
            <Icon name="clock" /> {format(task.date.toDate(), "dddd Do MMMM")}{" "}
            at {format(task.date.toDate(), "HH:mm")}|
            <Icon name="marker" /> {task.venue}
          </span>
        </Segment>
        <Segment secondary>
          <List horizontal>
            {task.attendees &&
              // after introducing fire store, below returns error.
              // need to understand why does Object.values correct problem
              // I'm pretty sure it's because in firestore, we are storing it as an object
              // rather than an array.
              objectToArray(task.attendees).map(attendee => (
                <TaskListAttendee key={attendee.id} attendee={attendee} />
              ))}
          </List>
        </Segment>
        <Segment clearing>
          <span>{task.description}</span>
          <Button
            as={Link}
            to={`/tasks/${task.id}`}
            color="teal"
            floated="right"
            content="View"
          />
        </Segment>
      </Segment.Group>
    );
  }
}

export default TaskListItem;
