const express = require('express');
const app = express();
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({ version: 'v3' });
const fs = require('fs');
const open = require('open');

const authenticateWithOAuth = async (clientDetails, port) => {
  const webServer = await startWebServer(port);
  const OAuthClient = await createOAuthClient(clientDetails.auth);
  registerUserConsent(OAuthClient);
  const authToken = await waitForGoogleCallback(webServer, clientDetails.clientUrl);
  await requestingGoogleForAccessToken(OAuthClient, authToken);
  setGlobalGoogleAuth(OAuthClient);
  await stopWebServer(webServer);
}

const startWebServer = (port) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
      resolve({
        app,
        server
      })
    })
  })
}

const createOAuthClient = (clientAuth) => {
  const { clientId, clientSecret, redirectUris } = clientAuth;
  const OAuthClient = new OAuth2(
    clientId,
    clientSecret,
    redirectUris[0]
  )
  return OAuthClient;
}

const registerUserConsent = (OAuthClient) => {
  const consentUrl = OAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube']
  });
  open(consentUrl);
}

const waitForGoogleCallback = (webServer, url = '/oauth2callback') => {
  return new Promise((resolve) => {
    console.log('Waiting for user consent...');
    webServer.app.get(url, (req, res) => {
      const authCode = req.query.code;
      console.log(`Consent given ${authCode}`);
      res.send('<h1>Thank you!</h1><p>You can now close this tab.</p>');
      resolve(authCode);
    })
  })
}

const requestingGoogleForAccessToken = (OAuthClient, authToken) => {
  return new Promise((resolve, reject) => {
    OAuthClient.getToken(authToken, (error, tokens) => {
      if(error) {
        return reject(error);
      }
      console.log('Access tokens created!');
      OAuthClient.setCredentials(tokens);
      resolve();
    })
  })
}

const setGlobalGoogleAuth = (OAuthClient) => {
  google.options({
    auth: OAuthClient
  });
}

const stopWebServer = (webServer) => {
  console.log('Stopping server!');
  return new Promise((resolve) => {
    webServer.server.close(() => {
      resolve();
    })
  })
}

const videoUpload = async (
  videoDetails,
  client,
  port
) => {
  const {
    path,
    title,
    tags = [],
    description = '',
    status = 'public',
    showUploadProgress = false
  } = videoDetails;

  await authenticateWithOAuth(client, port);
  const videoSize = fs.statSync(path).size;
  const requestParams = {
    part: 'snippet, status',
    requestBody: {
      snippet: {
        title,
        description,
        tags
      },
      status: {
        privacyStatus: status
      }
    },
    media: {
      body: fs.createReadStream(path)
    }
  };
  const youtubeResponse = await youtube.videos.insert(requestParams, {
    onUploadProgress: (event) => {
      if(showUploadProgress) {
        const progress = Math.round((event.bytesRead / videoSize) * 100);
        console.info(`${progress}%`);
      }
    }
  });

  console.log(`Video available at: https:/youtu.be/${youtubeResponse.data.id}`);
  return youtubeResponse.data;
};

module.exports = { videoUpload };