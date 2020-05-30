
# YOUTUBE-VIDEO-UPLOADER
### Instalation
```
 npm install youtube-video-uploader --save
```
### Import
```
 const { videoUpload } = require('youtube-video-uploader');
```

### Usage
 Google Console configuration:
  1. Go to: https://console.developers.google.com/
  2. After you have created a project go to `Credentials` tab
  3. Click on `+ Create Credentials`
  4. Select OAuth Client ID > Select Application type (Web Application)
  5. Add URI (in my example: `http://localhost:5010`)
  6. Add authorised redirect (in my example: `http://localhost:5010/oauth2callback`)
  7. After you have clicked on the save button, make sure you copy the `client_id`, `client_secret` and `redirect_uris` values. You can even download them after you have saved the OAuth Client.
  
In you app usage:

Call `videoUpload` function with following params:
```
videoUpload(
{
  auth: {
    clientId: String // google client id
    clientSecret: String // google client secret
    redirectUris: // google redirectUris, example: ['http://localhost:5010/oauth2callback']
  },
  clientUrl: '/oauth2callback'
},
{
  path: './test.mp4', // path to video (String) (Required)
  title: 'First video on youtube', // video title on youtube (String) (Required)
  tags: ['first', 'video', 'youtube'], // array of tags: (Array) (Optional)
  description: 'First video on youtube.', // video description (String) (Optional)
  status: // default it is 'public', other options are 'private', 'unlisted' (String) (Optional)
  showUploadProgress: // showing upload progress, by default it is false (Boolean) (Optional)
},
5010 // port which was added in the google console
)


You can upload only 5-6 videos on youtube using this method per day. Your daily quota is 10000 units per day, and a video upload costs approximately 1600 units. You can increase your daily quota: https://support.google.com/youtube/contact/yt_api_form

