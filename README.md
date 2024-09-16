# GBIF eDNA Publishing Tool

This is the user interface for a tool that converts OTU/ASV tables in tsv and xlsx to [BIOM format](https://biom-format.org/).
The generated BIOM files can be converted to [Darwin core](https://dwc.tdwg.org/) and published to https://www.gbif.org/.
It works on top of [edna-tool-backend](https://github.com/gbif/edna-tool-backend).

## Overall idea
* Web-based interface/tool that lets researchers (or other) publish an eDNA metabarcoding dataset to GBIF
* Minimal preparation/reformatting required
* Standardise and automate important steps to ensure interoperability with other datasets
* Compliance with community standards
* Include as many immediate benefits as long as they are easily implemented
* Prioritize fast and easy publication and online visibility (and later curation, correction) as opposed to a tedious publishing process with many steps and choices


# Tecnical details


In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
The page will reload when you make changes.\
You may also see any lint errors in the console.\
In development mode, the backend service is configured in the `.env` file through the `REACT_APP_API_URL` variable.


### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
To configure the the associated backend installation, set the environment variable `REACT_APP_API_URL`.

Example:
`REACT_APP_API_URL=http://localhost:9001 npm run build`

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### Funding
The development of this tool has received funding from the European Union's Horizon Europe research and innovation programme under grant agreement No 101057437 (BioDT project, https://doi.org/10.3030/101057437)

<img src="https://github.com/gbif/edna-tool-ui/blob/master/public/images/EN_Co-fundedbytheEU_RGB_POS.png" width="240">
