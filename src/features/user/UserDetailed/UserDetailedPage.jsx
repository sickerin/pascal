import React, { Component } from "react";
import { connect } from "react-redux";
import { firestoreConnect, isEmpty } from "react-redux-firebase";
import { compose } from "redux";
import { Grid } from "semantic-ui-react";
import { toastr } from "react-redux-toastr";
import UserDetailedDescription from "./UserDetailedDescription";
import UserDetailedTasks from "./UserDetailedTasks";
import UserDetailedHeader from "./UserDetailedHeader";
import UserDetailedPhotos from "./UserDetailedPhotos";
import UserDetailedSidebar from "./UserDetailedSidebar";
import { userDetailedQuery } from "../userQueries";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { getUserTasks } from "../userActions";

const mapState = (state, ownProps) => {
  let userUid = null;
  let profile = {};

  if (ownProps.match.params.id === state.auth.uid) {
    profile = state.firebase.profile;
  } else {
    profile =
      !isEmpty(state.firestore.ordered.profile) &&
      state.firestore.ordered.profile[0];
    userUid = ownProps.match.params.id;
  }

  return {
    auth: state.firebase.auth,
    profile: profile,
    userUid: userUid,
    photos: state.firestore.ordered.photos,
    tasks: state.tasks,
    tasksLoading: state.async.loading,
    requesting: state.firestore.status.requesting
  };
};

const actions = {
  getUserTasks
};

class UserDetailedPage extends Component {
  async componentDidMount() {
    let user = await this.props.firestore.get(
      `users/${this.props.match.params.id}`
    );
    if (!user.exists) {
      toastr.error("Not Found", "This user does not exist!");
      this.props.history.push("/error");
    }

    let tasks = await this.props.getUserTasks(this.props.userUid);
    console.log(tasks);
  }

  changeTab = (e, data) => {
    this.props.getUserTasks(this.props.userUid, data.activeIndex);
  };

  render() {
    const {
      profile,
      photos,
      auth,
      match,
      tasks,
      tasksLoading,
      requesting
    } = this.props;
    const isCurrentUser = auth.uid === match.params.id;
    const loading = requesting[`users/${match.params.id}`];

    if (loading) return <LoadingComponent inverted={true} />;

    return (
      <Grid>
        <UserDetailedHeader profile={profile} />
        <UserDetailedDescription profile={profile} />
        <UserDetailedSidebar isCurrentUser={isCurrentUser} />
        {photos && photos.length > 0 && <UserDetailedPhotos photos={photos} />}
        <UserDetailedTasks
          tasks={tasks}
          tasksLoading={tasksLoading}
          changeTab={this.changeTab}
        />
      </Grid>
    );
  }
}

export default compose(
  connect(
    mapState,
    actions
  ),
  firestoreConnect((auth, userUid) => userDetailedQuery(auth, userUid))
)(UserDetailedPage);
