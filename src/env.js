const { REACT_APP_API_URL } = process.env;

const env =  {
    "local": {
        "env": "local",
        "backend": REACT_APP_API_URL || "http://localhost:9000"
    },
    "uat": {
        "env": "uat",
        "backend": REACT_APP_API_URL || "/service"
    },
    "prod": {
        "env": "prod",
        "backend": REACT_APP_API_URL || "/service"
    }
    
}

export default env;