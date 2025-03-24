


const getUatDatasetText = (gbifUatKey) => gbifUatKey ? `I have published a test-version in the GBIF test environment (UAT): https://www.gbif-uat.org/dataset/${gbifUatKey}` : "";

const getSignature = user => (user?.firstName && user?.lastName ) ? `${user?.firstName} ${user?.lastName}` : ''

const getRegistryUrl = registryBaseUrl => `https://registry.${registryBaseUrl.split(".").slice(1).join(".")}` 

export const getExistingOrgEmailBody = ({ednaDatasetID, gbifUatKey, publishingOrganizationKey, publishingOrganizationTitle, toolBaseUrl, registryBaseUrl, user }) => `
Dear administrator of ${toolBaseUrl}.

I would like to publish my DNA Metabarcoding dataset: ${toolBaseUrl}/dataset/${ednaDatasetID} to GBIF.
${getUatDatasetText(gbifUatKey)}

I believe my institution/organization is already a GBIF data publisher: ${publishingOrganizationTitle} - ${getRegistryUrl(registryBaseUrl)}organization/${publishingOrganizationKey}.

My GBIF username is ${user?.userName}.

Could you please associate me with this institution/organization in ${toolBaseUrl} ?.

Administrators can do it here: ${toolBaseUrl}/admin/organizations?organizationKey=${publishingOrganizationKey}&name=${encodeURIComponent(publishingOrganizationTitle)}&userName=${encodeURIComponent(user?.userName)}

Kind regards

${getSignature(user)}
`

export const getNewOrgEmailBody = ({ednaDatasetID, gbifUatKey, toolBaseUrl, user }) => `
Dear administrator of ${toolBaseUrl}.

I would like to publish my DNA Metabarcoding dataset: ${toolBaseUrl}/dataset/${ednaDatasetID} to GBIF.
${getUatDatasetText(gbifUatKey)}

My GBIF username is ${user?.userName}.

It seems my institution/organization is not yet a GBIF publisher.
My institution contact details are:

Institution Name: [Please fill in your institution’s name]
Institution Address: [Please fill in your institution’s address]
Contact Email: [Please fill in your institution’s email]

Could you please help with the steps needed in order for me to be able to publish under this institution/organization?

Kind regards

${getSignature(user)}
`

export const getEmailBodyForNonPublishingMDTs = ({ednaDatasetID, gbifUatKey, toolBaseUrl, user}) => `Dear administrator of ${toolBaseUrl},

I would like to publish this DNA Metabarcoding dataset to GBIF:
${toolBaseUrl}/dataset/${ednaDatasetID}
${getUatDatasetText(gbifUatKey)}

My GBIF username is ${user?.userName}.

Please fill in the information for either Option 1 or Option 2:

Option 1: My Institution is Already Registered
I have checked the GBIF registry (https://www.gbif.org/become-a-publisher) and I believe my institution is already registered as a publisher.

GBIF publisher page: [Please copy/paste link: https://www.gbif.org/publisher/……]
OR
Institution Name: [Please fill in your institution’s name]

Option 2: My Institution is Not Registered
I did not look in the index OR I checked the GBIF registry and did not find my institution. It seems my institution/organization is not yet a GBIF publisher.

Institution Name: [Please fill in your institution’s name]
Institution Address: [Please fill in your institution’s address]
Contact Email: [Please fill in your institution’s email]

Could you please guide me through the steps required for me to publish under this institution/organization?

Kind regards,

${getSignature(user)}`

export const getEmailBodyForTokenRequest = ({organizationKey, toolBaseUrl, user}) => `Dear GBIF helpdesk,

A user of ${toolBaseUrl} would like to publish data from this organization: https://registry.gbif.org/organization/${organizationKey}.

Can you provide us with the shared token for this organization?

Kind regards,

${getSignature(user)}
`

export default {getExistingOrgEmailBody};
