import React from "react";
import { Header, Segment, Feed, Sticky } from "semantic-ui-react";
import TaskActivityItem from "./TaskActivityItem";

const TaskActivity = ({ activities, contextRef }) => {
  return (
    <Sticky context={contextRef} offset={100}>
      <Header attached="top" content="Recent Activity" />
      <Segment attached>
        <Feed>
          {activities &&
            activities.map(activity => (
              <TaskActivityItem key={activity.id} activity={activity} />
            ))}
        </Feed>
      </Segment>
    </Sticky>
  );
};

export default TaskActivity;
