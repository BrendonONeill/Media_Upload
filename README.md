# Wedding Upload
- Need to clean up UI on all screens.
- Fix error handling.
- sort something out for videos


# steps
- chunk video
- call bucket and start multipart upload
- convert blobs to buffer and upload
- call complete multipart upload

## Working on
- add indexedDB
- Filter broken with one image and need to deal with success and failure
- On abortion still runs other chunks need a hard stop
- The notification tab will have a close button that if an error occurs, will show an error tab with more information.
- Need to download and change files
- Clean up loading UI 
