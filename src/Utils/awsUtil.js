import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const getCurrentUser = () => {
  const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_AWS_COGNITO_APP_CLIENT_ID,
  });
  return userPool.getCurrentUser();
};

export const getUserToken = currentUser => new Promise((resolve, reject) => {
  currentUser.getSession((err, session) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(session.getIdToken().getJwtToken());
  });
});
