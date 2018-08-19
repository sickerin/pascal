import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementAsync, decrementAsync, testPermissions } from "./testActions";
import { Button } from "semantic-ui-react";
import Script from "react-load-script";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

//gets data from store
const mapState = state => ({
  data: state.test.data,
  loading: state.test.loading
});

//dispatches action to the store (mapdispatchtoactions)
const actions = {
  incrementAsync,
  decrementAsync,
  testPermissions
};

class TestComponent extends Component {
  state = {
    address: "",
    scriptLoaded: false
  };

  handleFormSubmit = task => {
    task.preventDefault();

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log("Success", latLng))
      .catch(error => console.error("Error", error));
  };

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  };

  onChange = address => this.setState({ address });

  render() {
    const inputProps = {
      value: this.state.address,
      onChange: this.onChange
    };

    const {
      incrementAsync,
      testPermissions,
      decrementAsync,
      data,
      loading
    } = this.props;
    return (
      <div>
        <Script
          url="https://maps.googleapis.com/maps/api/js?key=AIzaSyDOnd6oOXfeZUd67Vfx5YzKXR9BbXCrmSQ&libraries=places"
          onLoad={this.handleScriptLoad}
        />

        <h1>Test Area</h1>
        <h3>The answer is: {data}</h3>
        <Button
          loading={loading}
          onClick={incrementAsync}
          color="green"
          content="Increment"
        />
        <Button
          loading={loading}
          onClick={decrementAsync}
          color="red"
          content="Decrement"
        />
        <Button
          loading={loading}
          onClick={testPermissions}
          color="red"
          content="Permissions"
        />
        <br />
        <br />
        <form onSubmit={this.handleFormSubmit}>
          {this.state.scriptLoaded && (
            <PlacesAutocomplete inputProps={inputProps} />
          )}
          <Button type="submit">Submit</Button>
        </form>
      </div>
    );
  }
}

export default connect(
  mapState,
  actions
)(TestComponent);
