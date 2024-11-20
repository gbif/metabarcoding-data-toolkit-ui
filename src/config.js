import environments from "./env.js";

const domain = window.location.hostname;

let env = environments.prod;
if (
  domain.endsWith(".gbif-test.org") || domain.endsWith(".gbif-test.org")
) {
  env = environments.uat;
} else if (
  domain.startsWith("localhost") 
) {
  env = environments.local;
} 

export default env;
