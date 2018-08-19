import React, { Component } from "react";
import { withFirestore, firebaseConnect, isEmpty } from "react-redux-firebase";
import { toastr } from "react-redux-toastr";
import { compose } from "redux";
import { connect } from "react-redux";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import TaskDetailedHeader from "./TaskDetailedHeader";
import TaskDetailedChat from "./TaskDetailedChat";
import TaskDetailedInfo from "./TaskDetailedInfo";
// import { toastr } from "react-redux-toastr";
import TaskDetailedSideBar from "./TaskDetailedSideBar";
import {
  objectToArray,
  createDataTree
} from "../../../app/common/util/helpers";
import { goingToTask, cancelGoingToTask } from "../../user/userActions";
import { addTaskComment } from "../taskActions";
import { openModal } from "../../modals/modalActions";

const mapState = (state, ownProps) => {
  let task = {};

  // perhaps a better a solution here to display an error and redirecting user here./
  if (state.firestore.ordered.tasks && state.firestore.ordered.tasks[0]) {
    task = state.firestore.ordered.tasks[0];
  }

  return {
    requesting: state.firestore.status.requesting,
    task,
    auth: state.firebase.auth,
    loading: state.async.loading,
    taskChat:
      !isEmpty(state.firebase.data.task_chat) &&
      objectToArray(state.firebase.data.task_chat[ownProps.match.params.id])
  };
};

const actions = {
  goingToTask,
  cancelGoingToTask,
  addTaskComment,
  openModal
};

class TaskDetailedPage extends Component {
  state = {
    initialLoading: true
  };

  async componentDidMount() {
    const { firestore, match } = this.props;
    // check if task exists in firestore first
    let task = await firestore.get(`tasks/${match.params.id}`);
    if (!task.exists) {
      toastr.error("Not found", "The task does not exist");
      this.props.history.push("/error");
    } else {
    }
    await firestore.setListener(`tasks/${match.params.id}`);
    this.setState({
      initialLoading: false
    });
  }

  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`tasks/${match.params.id}`);
  }

  render() {
    const {
      task,
      auth,
      goingToTask,
      cancelGoingToTask,
      addTaskComment,
      loading,
      taskChat,
      openModal,
      requesting,
      match
    } = this.props;
    console.log(task);
    const attendees =
      task &&
      task.attendees &&
      objectToArray(task.attendees).sort(function(a, b) {
        return a.joinDate - b.joinDate;
      });
    const isManager = task.managerUid === auth.uid;
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);
    const chatTree = !isEmpty(taskChat) && createDataTree(taskChat);
    const authenticated = auth.isLoaded && !auth.isEmpty;
    const loadingTask = requesting[`tasks/${match.params.id}`];

    // inital loading because some empty components will load before the information
    if (loadingTask || this.state.initialLoading)
      return <LoadingComponent inverted={true} />;

    return (
      <Grid>
        <Grid.Column width={10}>
          <TaskDetailedHeader
            loading={loading}
            task={task}
            isManager={isManager}
            isGoing={isGoing}
            goingToTask={goingToTask}
            cancelGoingToTask={cancelGoingToTask}
            authenticated={authenticated}
            openModal={openModal}
          />
          <TaskDetailedInfo task={task} />
          {authenticated && (
            <TaskDetailedChat
              taskChat={chatTree}
              addTaskComment={addTaskComment}
              taskId={task.id}
            />
          )}
        </Grid.Column>
        <Grid.Column width={6}>
          <TaskDetailedSideBar attendees={attendees} />
        </Grid.Column>
      </Grid>
    );
  }
}

// export default compose(
//   withFirestore,
//   (connect(
//     mapState,
//     actions
//   ),
//   firebaseConnect(props => [`task_chat/${props.match.params.id}`]))
// )(TaskDetailedPage);

export default compose(
  withFirestore,
  connect(
    mapState,
    actions
  ),
  firebaseConnect(
    props =>
      props.auth.isLoaded &&
      !props.auth.isEmpty && [`task_chat/${props.match.params.id}`]
  )
)(TaskDetailedPage);
