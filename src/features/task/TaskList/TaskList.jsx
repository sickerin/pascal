import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroller";
import TaskListItem from "./TaskListItem";

class TaskList extends Component {
  render() {
    const { tasks, getNextTasks, loading, moreTasks } = this.props;
    return (
      <div>
        {tasks &&
          tasks.length !== 0 && (
            <InfiniteScroll
              pageStart={0}
              loadMore={getNextTasks}
              hasMore={!loading && moreTasks}
              initialLoad={false}
            >
              {tasks &&
                tasks.map(task => <TaskListItem key={task.id} task={task} />)}
            </InfiniteScroll>
          )}
      </div>
    );
  }
}

export default TaskList;
