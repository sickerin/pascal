import React from "react";
import { Grid, Segment, Header, Card, Image, Tab } from "semantic-ui-react";
import { Link } from "react-router-dom";
import format from "date-fns/format";

const panes = [
  { menuItem: "All tasks", pane: { key: "allTasks" } },
  { menuItem: "Past tasks", pane: { key: "pastTasks" } },
  { menuItem: "Future tasks", pane: { key: "futureTasks" } },
  { menuItem: "Managering", pane: { key: "managedTasks" } }
];

const UserDetailedTasks = ({ tasks, tasksLoading, changeTab }) => {
  return (
    <Grid.Column width={12}>
      <Segment loading={tasksLoading} attached>
        <Header icon="calendar" content="tasks" />
        <Tab
          onTabChange={(e, data) => changeTab(e, data)}
          panes={panes}
          menu={{ secondary: true, pointing: true }}
        />
        <br />
        <Card.Group itemsPerRow={5}>
          {tasks &&
            tasks.map(task => (
              <Card as={Link} to={`/tasks/${task.id}`} key={task.id}>
                <Image src={`/assets/categoryImages/${task.category}.jpg`} />
                <Card.Content>
                  <Card.Header textAlign="center">{task.title}</Card.Header>
                  <Card.Meta textAlign="center">
                    <div>
                      {format(task.date && task.date.toDate(), "DD MMM YYYY")}{" "}
                    </div>
                    <div>
                      {format(task.date && task.date.toDate(), "h:mm A")}{" "}
                    </div>
                  </Card.Meta>
                </Card.Content>
              </Card>
            ))}
        </Card.Group>
      </Segment>
    </Grid.Column>
  );
};

export default UserDetailedTasks;
