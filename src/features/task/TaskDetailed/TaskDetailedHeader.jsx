import React from "react";
import format from "date-fns/format";
import { Segment, Image, Header, Button, Item, Label } from "semantic-ui-react";
import { Link } from "react-router-dom";

const taskImageStyle = {
  filter: "brightness(30%)"
};

const taskImageTextStyle = {
  position: "absolute",
  bottom: "5%",
  left: "5%",
  width: "100%",
  height: "auto",
  color: "white"
};

const TaskDetailedHeader = ({
  task,
  isManager,
  isGoing,
  goingToTask,
  cancelGoingToTask,
  loading,
  authenticated,
  openModal
}) => {
  let taskDate;
  if (task.date) {
    taskDate = task.date.toDate();
  }

  return (
    <Segment.Group>
      <Segment basic attached="top" style={{ padding: "0" }}>
        <Image
          src={`/assets/categoryImages/${task.category}.jpg`}
          fluid
          style={taskImageStyle}
        />
        <Segment basic style={taskImageTextStyle}>
          <Item.Group>
            <Item>
              <Item.Content>
                <Header
                  size="huge"
                  content={task.title}
                  style={{ color: "white" }}
                />
                <p>{format(taskDate, "dddd Do MMMM")}</p>
                <p>
                  managed by <strong>{task.managedBy}</strong>
                </p>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
      </Segment>
      <Segment attached="bottom">
        {!isManager && (
          <div>
            {isGoing &&
              !task.cancelled && (
                <Button onClick={() => cancelGoingToTask(task)}>
                  Cancel My Place
                </Button>
              )}
            {!isGoing &&
              authenticated &&
              !task.cancelled && (
                <Button
                  loading={loading}
                  onClick={() => goingToTask(task)}
                  color="teal"
                >
                  ACCEPT THIS TASK
                </Button>
              )}
            {/* when not logged in */}
            {!authenticated &&
              !task.cancelled && (
                <Button
                  loading={loading}
                  onClick={() => {
                    openModal("UnauthModal");
                    console.log("broken?");
                  }}
                  color="teal"
                >
                  ACCEPT THIS TASK
                </Button>
              )}
            {task.cancelled &&
              !isManager && (
                <Label
                  size="large"
                  color="red"
                  content="This task has been cancelled"
                />
              )}
          </div>
        )}
        {isManager && (
          <Button as={Link} to={`/manage/${task.id}`} color="orange">
            Manage Task
          </Button>
        )}
      </Segment>
    </Segment.Group>
  );
};

export default TaskDetailedHeader;
