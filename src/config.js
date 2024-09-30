import environments from "./env.js";

const domain = window.location.hostname;

let env = environments.prod;
if (
  domain.endsWith(".gbif-uat.org") 
) {
  env = environments.uat;
} else if (
  domain.startsWith("localhost") 
) {
  env = environments.local;
} 

export default env;
