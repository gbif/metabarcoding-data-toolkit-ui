


const getUatDatasetText = (gbifUatKey) => gbifUatKey ? `I have tested the dataset at GBIF UAT: https://www.gbif-uat.org/dataset/${gbifUatKey}` : "";

const getSignature = user => (user?.firstName && user?.lastName ) ? `${user?.firstName} ${user?.lastName}` : ''

const getRegistryUrl = registryBaseUrl => `https://registry.${registryBaseUrl.split(".").slice(1).join(".")}` 

export const getExistingOrgEmailBody = ({ednaDatasetID, gbifUatKey, publishingOrganizationKey, publishingOrganizationTitle, toolBaseUrl, registryBaseUrl, user }) => `
Dear administrator of ${toolBaseUrl}.

I would like to publish my metabarcoding dataset: ${toolBaseUrl}/dataset/${ednaDatasetID} to GBIF.
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

I would like to publish my metabarcoding dataset: ${toolBaseUrl}/dataset/${ednaDatasetID} to GBIF.
${getUatDatasetText(gbifUatKey)}
My GBIF username is ${user?.userName}.

It seems my institution/organization is not yet a GBIF publisher.
My institution contact details are:

INSTITUTION NAME
INSTTUTION ADDRESS
CONTACT EMAIL

Could you please help with the steps needed in order for me to be able to publish under this institution/organization?

Kind regards

${getSignature(user)}
`

export default {getExistingOrgEmailBody};
