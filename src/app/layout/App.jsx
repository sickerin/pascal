import React, { Component } from "react";
import { Container } from "semantic-ui-react";
import Loadable from "react-loadable";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Route, Switch } from "react-router-dom";
// import TaskDashboard from "../../features/task/TaskDashboard/TaskDashboard";
// import NavBar from "../../features/nav/NavBar/NavBar";
// import TaskDetailedPage from "../../features/task/TaskDetailed/TaskDetailedPage";
// import TaskForm from "../../features/task/TaskForm/TaskForm";
// import SettingsDashboard from "../../features/user/Settings/SettingsDashboard";
// import UserDetailedPage from "../../features/user/UserDetailed/UserDetailedPage";
// import PeopleDashboard from "../../features/user/PeopleDashboard/PeopleDashboard";
// import HomePage from "../../features/home/HomePage";
// import TestComponent from "../../features/testarea/TestComponent";
// import ModalManager from "../../features/modals/ModalManager";
import { UserIsAuthenticated } from "../../features/auth/authWrapper";
// import NotFound from "../../app/layout/NotFound";

const AsyncHomePage = Loadable({
  loader: () => import("../../features/home/HomePage"),
  loading: LoadingComponent
});

const AsyncTaskForm = Loadable({
  loader: () => import("../../features/task/TaskForm/TaskForm"),
  loading: LoadingComponent
});

const AsyncNavBar = Loadable({
  loader: () => import("../../features/nav/NavBar/NavBar"),
  loading: LoadingComponent
});

const AsyncTaskDashboard = Loadable({
  loader: () => import("../../features/task/TaskDashboard/TaskDashboard"),
  loading: LoadingComponent
});

const AsyncSettingsDashboard = Loadable({
  loader: () => import("../../features/user/Settings/SettingsDashboard"),
  loading: LoadingComponent
});

const AsyncUserDetailedPage = Loadable({
  loader: () => import("../../features/user/UserDetailed/UserDetailedPage"),
  loading: LoadingComponent
});

const AsyncPeopleDashboard = Loadable({
  loader: () => import("../../features/user/PeopleDashboard/PeopleDashboard"),
  loading: LoadingComponent
});

const AsyncTaskDetailedPage = Loadable({
  loader: () => import("../../features/task/TaskDetailed/TaskDetailedPage"),
  loading: LoadingComponent
});

const AsyncModalManager = Loadable({
  loader: () => import("../../features/modals/ModalManager"),
  loading: LoadingComponent
});

const AsyncNotFound = Loadable({
  loader: () => import("../../app/layout/NotFound"),
  loading: LoadingComponent
});

class App extends Component {
  render() {
    return (
      <div>
        <AsyncModalManager />
        <Switch>
          <Route exact path="/" component={AsyncHomePage} />
        </Switch>
        <Route
          path="/(.+)"
          render={() => (
            <div>
              <AsyncNavBar />
              <Container className="main">
                <Switch>
                  <Route exact path="/tasks" component={AsyncTaskDashboard} />
                  <Route path="/tasks/:id" component={AsyncTaskDetailedPage} />
                  <Route
                    path="/manage/:id"
                    component={UserIsAuthenticated(AsyncTaskForm)}
                  />
                  <Route
                    path="/people"
                    component={UserIsAuthenticated(AsyncPeopleDashboard)}
                  />
                  <Route
                    path="/profile/:id"
                    component={UserIsAuthenticated(AsyncUserDetailedPage)}
                  />
                  <Route
                    path="/settings"
                    component={UserIsAuthenticated(AsyncSettingsDashboard)}
                  />
                  <Route
                    path="/createTask"
                    component={UserIsAuthenticated(AsyncTaskForm)}
                  />
                  <Route path="/error" component={AsyncNotFound} />
                  <Route component={AsyncNotFound} />
                </Switch>
              </Container>
            </div>
          )}
        />
      </div>
    );
  }
}

export default App;
