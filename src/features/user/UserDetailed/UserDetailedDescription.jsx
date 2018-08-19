import React from "react";
import { Grid, Segment, Header, Item, Icon, List } from "semantic-ui-react";
import format from "date-fns/format";

const UserDetailedDescription = ({ profile }) => {
  let createdAt;
  // format and todate can cause errors if done in the return block
  // so it's move outside it
  if (profile.createdAt) {
    createdAt = format(profile.createdAt, "D MMM YYYY");
  }
  return (
    <Grid.Column width={12}>
      <Segment>
        <Grid columns={2}>
          <Grid.Column width={10}>
            <Header icon="smile" content={profile.displayName} />
            <p>
              I am a: <strong>{profile.occupation || "Unknown"} </strong>
            </p>
            <p>
              Originally from <strong>{profile.origin || "Unknown"}</strong>
            </p>
            <p>
              Member Since: <strong>{createdAt}</strong>
            </p>
            <p>Description of user</p>
          </Grid.Column>
          <Grid.Column width={6}>
            <Header icon="heart outline" content="Interests" />
            {profile.interests ? (
              <List>
                {profile.interests &&
                  profile.interests.map((interest, index) => (
                    <Item key={index}>
                      <Icon name="heart" />
                      <Item.Content>{interest}</Item.Content>
                    </Item>
                  ))}
              </List>
            ) : (
              <p> No interests </p>
            )}
          </Grid.Column>
        </Grid>
      </Segment>
    </Grid.Column>
  );
};

export default UserDetailedDescription;
