import React, { Component } from "react";
import { Grid, Loader } from "semantic-ui-react";
import { firestoreConnect } from "react-redux-firebase";
import TaskList from "../TaskList/TaskList";
import { connect } from "react-redux";
import { getTasksForDashboard } from "../taskActions";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import TaskActivity from "../TaskActivity/TaskActivity";

const query = [
  {
    collection: "activity",
    orderBy: ["timestamp", "desc"],
    limit: 5
  }
];

const mapState = state => ({
  tasks: state.tasks,
  loading: state.async.loading,
  activities: state.firestore.ordered.activity
});

const actions = {
  getTasksForDashboard
};

class TaskDashboard extends Component {
  state = {
    moreTasks: false,
    loadingInitial: true,
    loadedTasks: [],
    // handleContextRef: {}
    contextRef: {}
  };

  async componentDidMount() {
    let next = await this.props.getTasksForDashboard();
    console.log(next);

    if (next && next.docs && next.docs.length > 1) {
      this.setState({
        moreTasks: true,
        loadingInitial: false
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tasks !== nextProps.tasks) {
      this.setState({
        loadedTasks: [...this.state.loadedTasks, ...nextProps.tasks]
      });
    }
  }
  getNextTasks = async () => {
    const { tasks } = this.props;
    let lastTask = tasks && tasks[tasks.length - 1];
    console.log(lastTask);
    let next = await this.props.getTasksForDashboard(lastTask);
    console.log(next);
    if (next && next.docs && next.docs.length <= 1) {
      this.setState({
        moreTasks: false
      });
    }
  };

  handleContextRef = contextRef => this.setState({ contextRef });

  render() {
    const { loading, activities } = this.props;
    const { moreTasks, loadedTasks } = this.state;
    // if (this.state.loadingInitial) {
    //   return <LoadingComponent inverted={true} />;
    // }
    return (
      <Grid>
        <Grid.Column width={10}>
          <div ref={this.handleContextRef}>
            <TaskList
              loading={loading}
              moreTasks={moreTasks}
              getNextTasks={this.getNextTasks}
              tasks={loadedTasks}
            />
          </div>
        </Grid.Column>
        <Grid.Column width={6}>
          <TaskActivity
            activities={activities}
            contextRef={this.state.contextRef}
          />
        </Grid.Column>
        <Grid.Column width={10}>
          <Loader active={loading} />
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(
  mapState,
  actions
)(firestoreConnect(query)(TaskDashboard));
